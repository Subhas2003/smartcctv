import Camera from "../models/Camera.js";

// Global stream status (checked periodically by pinging the camera URL)
export let isStreamOnline = false;
export let streamLastSeen = null;

export const setStreamStatus = (status, lastSeen = null) => {
  isStreamOnline = status;
  if (lastSeen) {
    streamLastSeen = lastSeen;
  }
};

// @desc    Register camera heartbeat
// @route   POST /api/cameras/heartbeat
// @access  Public
export const registerHeartbeat = async (req, res, next) => {
  try {
    const {
      cameraId,
      name = "Main Camera",
      cpuUsage = 0,
      memoryUsage = 0,
      temperature = 0,
      networkStatus = "Good",
    } = req.body;

    if (!cameraId) {
      return res.status(400).json({ message: "CameraId is required" });
    }

    let camera = await Camera.findOne({ cameraId });

    // Determine status (Warning if CPU > 85% or Temperature > 75°C)
    let computedStatus = "Online";
    if (cpuUsage > 85 || temperature > 75) {
      computedStatus = "Warning";
    }

    const previousStatus = camera ? camera.status : "Offline";
    const now = Date.now();

    if (!camera) {
      camera = await Camera.create({
        cameraId,
        name,
        status: computedStatus,
        cpuUsage,
        memoryUsage,
        temperature,
        networkStatus,
        lastSeen: now,
      });
    } else {
      camera.name = name;
      camera.status = computedStatus;
      camera.cpuUsage = cpuUsage;
      camera.memoryUsage = memoryUsage;
      camera.temperature = temperature;
      camera.networkStatus = networkStatus;
      camera.lastSeen = now;
      await camera.save();
    }

    // Broadcast if status changed (e.g. from Offline -> Online/Warning)
    if (previousStatus === "Offline" || previousStatus !== computedStatus) {
      const io = req.app.get("io");
      if (io) {
        io.emit("camera_status_changed", camera);
      }
    }

    res.json({ message: "Heartbeat processed successfully", camera });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered cameras
// @route   GET /api/cameras
// @access  Private
export const getCameras = async (req, res, next) => {
  try {
    const cameras = await Camera.find().sort({ lastSeen: -1 });
    res.json(cameras);
  } catch (error) {
    next(error);
  }
};

// @desc    Get live stream availability status
// @route   GET /api/cameras/stream-status
// @access  Private
export const getStreamStatus = async (req, res, next) => {
  try {
    res.json({
      online: isStreamOnline,
      lastSeen: streamLastSeen,
    });
  } catch (error) {
    next(error);
  }
};
