import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Alert type is required"],
      enum: ["Fire", "Smoke", "Person", "Motion"],
    },
    cameraId: {
      type: String,
      default: "cam_1",
      trim: true,
    },
    cameraName: {
      type: String,
      default: "Main Camera",
      trim: true,
    },
    confidence: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Resolved", "False Positive"],
      default: "Active",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
