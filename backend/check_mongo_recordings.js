import mongoose from "mongoose";
import dotenv from "dotenv";
import Recording from "./models/Recording.js";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const checkRecordings = async () => {
  try {
    console.log("Connecting to MongoDB:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const count = await Recording.countDocuments();
    console.log(`Total recordings in database: ${count}`);

    const recordings = await Recording.find().limit(10);
    console.log("First 10 recordings in DB:");
    recordings.forEach((r) => {
      console.log(`- ID: ${r._id} | Filename: ${r.filename} | Key: ${r.key} | URL: ${r.url}`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error checking recordings:", error);
  }
};

checkRecordings();
