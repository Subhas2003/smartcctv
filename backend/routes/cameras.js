import express from "express";
import {
  registerHeartbeat,
  getCameras,
  getStreamStatus,
} from "../controllers/cameraController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/heartbeat", registerHeartbeat); // Public endpoint for Raspberry Pi heartbeat pings
router.get("/", protect, getCameras);
router.get("/stream-status", protect, getStreamStatus);

export default router;
