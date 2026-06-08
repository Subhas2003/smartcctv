import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3Client from "./config/s3.js";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";

const listS3Files = async () => {
  console.log(`Listing files in bucket: ${BUCKET_NAME}`);
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    const response = await s3Client.send(command);
    if (response.Contents && response.Contents.length > 0) {
      console.log("✅ Objects found in S3 bucket:");
      response.Contents.forEach((item) => {
        console.log(`- Key: ${item.Key} | Size: ${(item.Size / 1024 / 1024).toFixed(2)} MB | Last Modified: ${item.LastModified}`);
      });
    } else {
      console.log("⚠️ No objects found in the S3 bucket. It is empty.");
    }
  } catch (error) {
    console.error("❌ Error listing S3 files:", error.message);
  }
};

listS3Files();
