import dotenv from "dotenv";
import s3Client from "./config/s3.js";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const testContentTypeOverride = async () => {
  try {
    const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";
    console.log("Listing S3 files...");
    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(listCommand);

    const validItem = response.Contents.find(item => item.Key.endsWith(".mp4") && item.Size > 1024 * 1024);
    if (!validItem) {
      console.log("No valid > 1MB mp4 found.");
      return;
    }

    console.log(`Found item: ${validItem.Key}`);
    
    // Generate signed URL with ResponseContentType override
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: validItem.Key,
      ResponseContentType: "video/mp4",
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log("Generated Signed URL with override:", signedUrl);

    console.log("Fetching url...");
    const res = await fetch(signedUrl);
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log("Content-Type Header:", res.headers.get("content-type"));

    if (res.headers.get("content-type") === "video/mp4") {
      console.log("✅ Success! Content-Type successfully overridden to video/mp4!");
    } else {
      console.log("❌ Failed to override Content-Type.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

testContentTypeOverride();
