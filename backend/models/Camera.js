import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Online", "Offline", "Warning"],
      default: "Offline",
    },
    cpuUsage: {
      type: Number,
      default: 0,
    },
    memoryUsage: {
      type: Number,
      default: 0,
    },
    temperature: {
      type: Number,
      default: 0,
    },
    networkStatus: {
      type: String,
      default: "Good",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Camera = mongoose.model("Camera", cameraSchema);
export default Camera;
