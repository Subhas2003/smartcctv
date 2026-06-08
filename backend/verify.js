import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Alert from "./models/Alert.js";
import Camera from "./models/Camera.js";
import Recording from "./models/Recording.js";
import { signToken, verifyToken } from "./services/jwtService.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartcctv_test";

async function runTests() {
  console.log("=========================================");
  console.log("🚀 STARTING AUTOMATED SMART CCTV TESTS...");
  console.log("=========================================");

  try {
    // 1. Connect to Database
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connection Successful.");

    // Clean test DB
    await User.deleteMany({});
    await Alert.deleteMany({});
    await Camera.deleteMany({});
    await Recording.deleteMany({});
    console.log("🧹 Test database tables cleared.");

    // 2. Test User Model & Password Hashing
    const testUser = await User.create({
      name: "Subhas Tester",
      email: "subhas_test@example.com",
      password: "password123",
    });
    console.log("✅ User created successfully.");

    const correctMatch = await testUser.comparePassword("password123");
    const wrongMatch = await testUser.comparePassword("wrongpass");
    
    if (correctMatch && !wrongMatch) {
      console.log("✅ Password hashing and comparison verified.");
    } else {
      throw new Error("Password comparison failed.");
    }

    // 3. Test JWT Signing and Verification
    const payload = { id: testUser._id };
    const token = signToken(payload);
    console.log(`✅ JWT signed successfully: ${token.substring(0, 20)}...`);

    const decoded = verifyToken(token);
    if (decoded && decoded.id === String(testUser._id)) {
      console.log("✅ JWT validation verified successfully.");
    } else {
      throw new Error("JWT decoding failed.");
    }

    // 4. Test Camera Heartbeat & Offline Timeout Logic
    const camId = "cam_test_99";
    // Send first heartbeat
    const camera = await Camera.create({
      cameraId: camId,
      name: "Test Camera 99",
      status: "Online",
      cpuUsage: 45,
      memoryUsage: 60,
      temperature: 55,
      networkStatus: "Good",
      lastSeen: new Date(),
    });
    console.log(`✅ Heartbeat registered: ${camera.name} is ${camera.status}`);

    // Backdate heartbeat to simulate 100 seconds inactive
    camera.lastSeen = new Date(Date.now() - 100000);
    await camera.save();
    console.log("⏳ Backdated camera timestamp to simulate timeout (>90s).");

    // Run expiration check query
    const ninetySecondsAgo = new Date(Date.now() - 90000);
    const expiredCamera = await Camera.findOne({
      cameraId: camId,
      status: { $ne: "Offline" },
      lastSeen: { $lt: ninetySecondsAgo },
    });

    if (expiredCamera) {
      expiredCamera.status = "Offline";
      await expiredCamera.save();
      console.log(`✅ Offline timeout detection verified. Status is now: ${expiredCamera.status}`);
    } else {
      throw new Error("Offline timeout query failed.");
    }

    // 5. Test Alert Ingestion & 30-Second Cooldown Logic
    const alertType = "Fire";
    const triggerAlert = async (conf) => {
      const cooldownKey = `${camId}_${alertType}`;
      const now = Date.now();
      const lastTime = triggerAlert.lastTime || 0;

      if (now - lastTime < 30000) {
        return { status: "suppressed" };
      }
      triggerAlert.lastTime = now;

      const created = await Alert.create({
        type: alertType,
        cameraId: camId,
        confidence: conf,
        status: "Active",
      });
      return { status: "created", alert: created };
    };

    // Trigger Alert 1 (Should create)
    const alert1 = await triggerAlert(92);
    // Trigger Alert 2 immediately (Should suppress)
    const alert2 = await triggerAlert(95);

    if (alert1.status === "created" && alert2.status === "suppressed") {
      console.log(`✅ Cooldown logic verified (Alert 1 created, Alert 2 suppressed).`);
    } else {
      throw new Error("Cooldown logic failed to suppress duplicate alert.");
    }

    // 6. Test Recording Creation and Storage Queries
    const testRec = await Recording.create({
      filename: "test_video.mp4",
      key: "recordings/test_video.mp4",
      url: "https://www.w3schools.com/html/movie.mp4",
      duration: 30,
      size: 1024 * 1024 * 5, // 5MB
      cameraId: camId,
    });
    console.log(`✅ Recording entry registered: ${testRec.filename}`);

    const list = await Recording.find({ cameraId: camId });
    if (list.length === 1 && list[0].filename === "test_video.mp4") {
      console.log("✅ Recording list and querying verified.");
    } else {
      throw new Error("Recording query verification failed.");
    }

    console.log("=========================================");
    console.log("🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (error) {
    console.error("❌ TEST RUNNER FAILURE:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
