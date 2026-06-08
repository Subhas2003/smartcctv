import express from "express";
import {
  getAlerts,
  resolveAlert,
  addAlertNotes,
  deleteAlert,
  triggerAlert,
  triggerFireAlert,
} from "../controllers/alertController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAlerts);
router.put("/:id/resolve", protect, resolveAlert);
router.put("/:id/notes", protect, addAlertNotes);
router.delete("/:id", protect, deleteAlert);
router.post("/trigger", triggerAlert); // Public route for Raspberry Pi/test scripting
router.post("/fire", triggerFireAlert); // Public route for Raspberry Pi fire detection

export default router;
