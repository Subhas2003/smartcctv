import express from "express";
import {
  registerHeartbeat,
  getCameras,
  getStreamStatus,
  createCamera,
  getCameraById,
  updateCamera,
  deleteCamera,
} from "../controllers/cameraController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/heartbeat", registerHeartbeat); // Public endpoint for Raspberry Pi heartbeat pings
router.get("/stream-status", protect, getStreamStatus);

// CRUD routes for user-managed cameras
router.post("/", protect, createCamera);
router.get("/", protect, getCameras);
router.get("/:id", protect, getCameraById);
router.put("/:id", protect, updateCamera);
router.delete("/:id", protect, deleteCamera);

export default router;

