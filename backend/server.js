import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import alertRoutes from "./routes/alerts.js";
import recordingRoutes from "./routes/recordings.js";
import cameraRoutes from "./routes/cameras.js";
import errorHandler from "./middleware/errorMiddleware.js";
import Camera from "./models/Camera.js";
import { setStreamStatus } from "./controllers/cameraController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // needed for image streaming
}));

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  frontendUrl,
  frontendUrl.replace(/\/$/, ""), // Remove trailing slash if present
  "http://127.0.0.1:5173",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is explicitly allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin + "/")) {
      return callback(null, true);
    }
    
    // Fallback: Dynamically allow any netlify.app or vercel.app subdomain for deployment flexibility
    const isDeployDomain = origin.endsWith("netlify.app") || origin.endsWith("vercel.app") || 
                           origin.includes(".netlify.app") || origin.includes(".vercel.app");
    if (isDeployDomain) {
      return callback(null, true);
    }
    
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/cameras", cameraRoutes);

// Global Error Handler
app.use(errorHandler);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: [frontendUrl, "http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Expose Socket.IO instance to Express routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Periodic task 1: Heartbeat expiration checker (Runs every 10 seconds)
setInterval(async () => {
  try {
    const ninetySecondsAgo = new Date(Date.now() - 90000);
    
    // Find all cameras that were active but haven't sent a heartbeat for > 90s
    const offlineCameras = await Camera.find({
      status: { $ne: "Offline" },
      lastSeen: { $lt: ninetySecondsAgo },
    });

    for (const camera of offlineCameras) {
      camera.status = "Offline";
      await camera.save();
      console.log(`Camera ${camera.cameraId} marked Offline due to timeout.`);

      // Broadcast camera offline update via Socket.IO
      io.emit("camera_status_changed", camera);
      
      // Broadcast critical camera offline event for notification
      io.emit("critical_camera_offline", {
        cameraId: camera.cameraId,
        name: camera.name,
        message: "Camera went offline: Heartbeat lost",
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("Error checking camera heartbeats:", error);
  }
}, 10000);

// Periodic task 2: Stream status checker (Runs every 10 seconds)
const checkStreamStatus = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

  try {
    const response = await fetch("https://camera.smartcctv2026.me/video_feed", {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    // Immediately abort stream connection to avoid downloading indefinitely
    controller.abort();
    
    const isOnline = response.status >= 200 && response.status < 400;
    return isOnline;
  } catch (error) {
    clearTimeout(timeout);
    return false;
  }
};

let lastStreamState = false;
setInterval(async () => {
  const isOnline = await checkStreamStatus();
  setStreamStatus(isOnline, isOnline ? new Date() : null);

  if (isOnline !== lastStreamState) {
    lastStreamState = isOnline;
    console.log(`Live Stream Status changed: ${isOnline ? "ONLINE" : "OFFLINE"}`);
    io.emit("stream_status_changed", {
      online: isOnline,
      lastSeen: isOnline ? new Date() : null,
    });
  }
}, 10000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
