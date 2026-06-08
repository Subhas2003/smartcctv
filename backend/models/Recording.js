import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 30, // Default to 30 seconds
    },
    size: {
      type: Number,
      default: 0, // Size in bytes
    },
    cameraId: {
      type: String,
      default: "cam_1",
    },
    cameraName: {
      type: String,
      default: "Main Camera",
    },
  },
  {
    timestamps: true,
  }
);

const Recording = mongoose.model("Recording", recordingSchema);
export default Recording;
