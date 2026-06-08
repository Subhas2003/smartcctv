import Alert from "../models/Alert.js";
import Camera from "../models/Camera.js";

const COOLDOWN_MS = 30000; // 30 seconds cooldown
const lastAlertTimes = new Map();

// @desc    Get alerts with search, filter, sort, pagination
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const {
      search,
      type,
      status,
      sortBy = "timestamp",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search query
    if (search) {
      query.$or = [
        { cameraName: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const total = await Alert.countDocuments(query);

    // Calculate sort object
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Fetch alerts
    const alerts = await Alert.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Get statistics for the dashboard summaries
    const totalAlerts = await Alert.countDocuments();
    
    // Today's start timestamp
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysAlerts = await Alert.countDocuments({ timestamp: { $gte: startOfToday } });
    
    const activeAlerts = await Alert.countDocuments({ status: "Active" });
    const resolvedAlerts = await Alert.countDocuments({ status: "Resolved" });

    res.json({
      alerts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
      stats: {
        total: totalAlerts,
        today: todaysAlerts,
        active: activeAlerts,
        resolved: resolvedAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark alert resolved
// @route   PUT /api/alerts/:id/resolve
// @access  Private
export const resolveAlert = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.status = "Resolved";
    if (notes !== undefined) {
      alert.notes = notes;
    }

    await alert.save();

    // Broadcast update
    const io = req.app.get("io");
    if (io) {
      io.emit("alert_updated", alert);
    }

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

// @desc    Add notes to alert
// @route   PUT /api/alerts/:id/notes
// @access  Private
export const addAlertNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.notes = notes || "";
    await alert.save();

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    await alert.deleteOne();

    res.json({ message: "Alert removed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger new alert (External/RPi entry point)
// @route   POST /api/alerts/trigger
// @access  Public (RPi access, optionally authenticated but public for simple tunnel integrations)
export const triggerAlert = async (req, res, next) => {
  try {
    const { type, cameraId = "cam_1", cameraName = "Main Camera", confidence } = req.body;

    if (!type || confidence === undefined) {
      return res.status(400).json({ message: "Type and confidence are required" });
    }

    // Cooldown check (30 seconds per camera/type combo)
    const cooldownKey = `${cameraId}_${type}`;
    const now = Date.now();
    const lastTime = lastAlertTimes.get(cooldownKey);

    if (lastTime && now - lastTime < COOLDOWN_MS) {
      return res.status(200).json({
        message: "Alert suppressed due to cooldown",
        cooldownRemainingSeconds: Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000),
      });
    }

    // Save alert time
    lastAlertTimes.set(cooldownKey, now);

    // Save alert to database
    const alert = await Alert.create({
      type,
      cameraId,
      cameraName,
      confidence,
      status: "Active",
    });

    // Broadcast real-time alert via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new_alert", alert);
    }

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger fire alert (External/RPi entry point for Fire Alerts)
// @route   POST /api/alerts/fire
// @access  Public
export const triggerFireAlert = async (req, res, next) => {
  try {
    const { cameraId, type, confidence } = req.body;

    // Validate payload
    if (!cameraId || typeof cameraId !== "string" || cameraId.trim() === "") {
      return res.status(400).json({ message: "cameraId must be a non-empty string" });
    }

    if (!type || type.toLowerCase() !== "fire") {
      return res.status(400).json({ message: "type must be 'fire'" });
    }

    if (confidence === undefined || typeof confidence !== "number" || confidence < 0 || confidence > 100) {
      return res.status(400).json({ message: "confidence must be a number between 0 and 100 (or 0.0 and 1.0)" });
    }

    // Normalize confidence: if <= 1.0, convert to percentage, round to integer
    const normalizedConfidence = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
    const normalizedType = "Fire"; // Enum in schema: Fire, Smoke, Person, Motion

    // Cooldown check (30 seconds per camera)
    const cooldownKey = `${cameraId}_${normalizedType}`;
    const now = Date.now();
    const lastTime = lastAlertTimes.get(cooldownKey);

    if (lastTime && now - lastTime < COOLDOWN_MS) {
      return res.status(200).json({
        message: "Alert suppressed due to cooldown",
        cooldownRemainingSeconds: Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000),
      });
    }

    // Save alert time
    lastAlertTimes.set(cooldownKey, now);

    // Look up camera name if registered
    let cameraName = "Camera " + cameraId;
    const camera = await Camera.findOne({ cameraId });
    if (camera) {
      cameraName = camera.name;
    }

    // Save alert to database
    const alert = await Alert.create({
      type: normalizedType,
      cameraId,
      cameraName,
      confidence: normalizedConfidence,
      status: "Active",
    });

    // Broadcast real-time alert via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new_alert", alert);
    }

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
};
