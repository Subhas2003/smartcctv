import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cameraName: {
      type: String,
      required: function () {
        return !!this.userId;
      },
      trim: true,
    },
    location: {
      type: String,
      required: function () {
        return !!this.userId;
      },
      trim: true,
    },
    streamUrl: {
      type: String,
      required: function () {
        return !!this.userId;
      },
      trim: true,
    },
    cameraId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
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

// Synchronize legacy 'name' with 'cameraName' before saving
cameraSchema.pre("save", function (next) {
  if (this.cameraName && !this.name) {
    this.name = this.cameraName;
  }
  next();
});

const Camera = mongoose.model("Camera", cameraSchema);
export default Camera;

