import dotenv from "dotenv";
import { getDownloadUrl } from "./services/awsService.js";
import s3Client from "./config/s3.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const testUrl = async () => {
  try {
    const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";
    console.log("Listing S3 files...");
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    const response = await s3Client.send(command);
    if (!response.Contents || response.Contents.length === 0) {
      console.log("No contents found.");
      return;
    }

    // Find the first .mp4 file with size > 1MB
    const validItem = response.Contents.find(item => item.Key.endsWith(".mp4") && item.Size > 1024 * 1024);
    if (!validItem) {
      console.log("No valid > 1MB mp4 found.");
      return;
    }

    console.log(`Found valid item: ${validItem.Key} (${(validItem.Size / 1024 / 1024).toFixed(2)} MB)`);
    const signedUrl = await getDownloadUrl(validItem.Key);
    console.log("Signed URL generated:", signedUrl);

    console.log("Testing fetching the URL...");
    const res = await fetch(signedUrl);
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    const headers = {};
    res.headers.forEach((val, key) => { headers[key] = val; });
    console.log("Response Headers:", headers);

    if (res.status !== 200) {
      const text = await res.text();
      console.log("Error response body:", text);
    } else {
      console.log("✅ Success! The signed URL is accessible.");
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
};

testUrl();
