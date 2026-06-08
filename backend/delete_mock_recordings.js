import mongoose from "mongoose";
import dotenv from "dotenv";
import Recording from "./models/Recording.js";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const cleanMockRecordings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for cleanup.");

    // Delete recordings with keys containing 'recordings/'
    const result = await Recording.deleteMany({
      key: { $regex: "^recordings/" }
    });
    console.log(`Deleted ${result.deletedCount} mock recordings.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error cleaning up recordings:", error);
  }
};

cleanMockRecordings();
