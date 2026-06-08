import mongoose from "mongoose";

import dns from 'dns'

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartcctv";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (uri.startsWith("mongodb+srv://")) {
      console.log("Attempting automatic fallback to local MongoDB server (mongodb://127.0.0.1:27017)...");
      try {
        const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/smartcctv");
        console.log(`MongoDB Connected (Local Fallback): ${localConn.connection.host}`);
      } catch (localError) {
        console.error(`Local MongoDB connection also failed: ${localError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
