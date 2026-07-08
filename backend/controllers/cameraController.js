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

// @desc    Get all registered cameras for the logged-in user
// @route   GET /api/cameras
// @access  Private
export const getCameras = async (req, res, next) => {
  try {
    const cameras = await Camera.find({}).sort({ createdAt: -1 });
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

// @desc    Create a new camera
// @route   POST /api/cameras
// @access  Private
export const createCamera = async (req, res, next) => {
  try {
    const { cameraName, location, streamUrl } = req.body;

    if (!cameraName || !location || !streamUrl) {
      return res.status(400).json({ message: "All fields are required (cameraName, location, streamUrl)" });
    }

    const camera = await Camera.create({
      userId: req.user._id,
      cameraName,
      location,
      streamUrl,
      cameraId: `cam_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: "Offline",
    });

    res.status(201).json(camera);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single camera by ID
// @route   GET /api/cameras/:id
// @access  Private
export const getCameraById = async (req, res, next) => {
  try {
    const camera = await Camera.findOne({ _id: req.params.id });

    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    res.json(camera);
  } catch (error) {
    next(error);
  }
};

// @desc    Update camera
// @route   PUT /api/cameras/:id
// @access  Private
export const updateCamera = async (req, res, next) => {
  try {
    const { cameraName, location, streamUrl } = req.body;

    if (!cameraName || !location || !streamUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let camera = await Camera.findOne({ _id: req.params.id });

    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    camera.cameraName = cameraName;
    camera.location = location;
    camera.streamUrl = streamUrl;

    await camera.save();

    res.json(camera);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete camera
// @route   DELETE /api/cameras/:id
// @access  Private
export const deleteCamera = async (req, res, next) => {
  try {
    const camera = await Camera.findOne({ _id: req.params.id });

    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    await camera.deleteOne();

    res.json({ message: "Camera removed successfully" });
  } catch (error) {
    next(error);
  }
};

