import mongoose from "mongoose";
import dotenv from "dotenv";
import Recording from "./models/Recording.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3Client from "./config/s3.js";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";

const syncRecordingsWithS3 = async () => {
  try {
    console.log("Starting sync with S3 bucket:", BUCKET_NAME);
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "mock-key") {
      console.log("Mock AWS credentials detected, skipping sync.");
      return;
    }

    console.log("Listing S3 objects...");
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    const response = await s3Client.send(command);

    if (response.Contents && response.Contents.length > 0) {
      console.log(`Found ${response.Contents.length} total objects in S3.`);
      // Get all existing keys in DB
      const existingRecordings = await Recording.find({}, "key");
      const existingKeys = new Set(existingRecordings.map((r) => r.key));
      console.log(`Existing recordings in DB: ${existingKeys.size}`);

      const newRecordings = [];
      for (const item of response.Contents) {
        // Log all files seen
        console.log(`- File in S3: ${item.Key} | Size: ${item.Size}`);

        // Only register .mp4 videos with non-zero sizes
        if (!item.Key.endsWith(".mp4")) {
          console.log(`  -> Skipped: Not an mp4 file`);
          continue;
        }
        if (item.Size === 0) {
          console.log(`  -> Skipped: File size is 0`);
          continue;
        }

        if (!existingKeys.has(item.Key)) {
          const parts = item.Key.split("/");
          const filename = parts.length > 1 ? `${parts[0]}_${parts[1]}` : item.Key;

          newRecordings.push({
            filename,
            key: item.Key,
            url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${item.Key}`,
            duration: 30, // Default approximation
            size: item.Size,
            timestamp: item.LastModified || new Date(),
            cameraId: "cam_1",
            cameraName: "Main Camera",
          });
          console.log(`  -> Added to insert queue: ${filename}`);
        } else {
          console.log(`  -> Skipped: Already in DB`);
        }
      }

      if (newRecordings.length > 0) {
        await Recording.insertMany(newRecordings);
        console.log(`✅ Synced with S3: Added ${newRecordings.length} new recordings to database.`);
      } else {
        console.log("No new recordings to add.");
      }
    } else {
      console.log("No contents found in S3 response.");
    }
  } catch (error) {
    console.warn("⚠️ S3 sync failed:", error);
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
    await syncRecordingsWithS3();
    await mongoose.disconnect();
    console.log("DB disconnected");
  } catch (err) {
    console.error(err);
  }
};

run();
