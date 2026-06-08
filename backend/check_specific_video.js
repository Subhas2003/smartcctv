import dotenv from "dotenv";
import { getDownloadUrl } from "./services/awsService.js";
import s3Client from "./config/s3.js";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const checkVideo = async () => {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";
  const key = "2026-06-04/10-47-40.mp4";

  try {
    console.log(`Getting headers for key: ${key}`);
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const meta = await s3Client.send(headCommand);
    console.log("Metadata:", {
      ContentLength: meta.ContentLength,
      ContentType: meta.ContentType,
      LastModified: meta.LastModified,
      ETag: meta.ETag
    });

    console.log("Generating pre-signed URL...");
    const signedUrl = await getDownloadUrl(key);
    console.log("Signed URL:", signedUrl);

    console.log("Fetching signed URL...");
    const res = await fetch(signedUrl);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log("Response Content-Type:", res.headers.get("content-type"));
    console.log("Response Content-Length:", res.headers.get("content-length"));

    if (res.status !== 200) {
      const text = await res.text();
      console.log("Error Response Body:", text);
    }
  } catch (error) {
    console.error("Error checking video:", error);
  }
};

checkVideo();
