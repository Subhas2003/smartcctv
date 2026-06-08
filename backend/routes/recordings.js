import express from "express";
import {
  getRecordings,
  getRecordingUrl,
  deleteRecording,
  triggerRecording,
} from "../controllers/recordingController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecordings);
router.get("/:id/url", protect, getRecordingUrl);
router.delete("/:id", protect, deleteRecording);
router.post("/trigger", triggerRecording); // Ingest new recordings from RPi

export default router;
