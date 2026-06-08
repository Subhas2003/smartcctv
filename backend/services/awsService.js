import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "smartcctv-recordings-2026";

export const getDownloadUrl = async (key) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "mock-key") {
      return `/mock-recordings/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentType: "video/mp4",
    });
    
    // URL expires in 1 hour (3600 seconds)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.warn(`S3 Presign Error, falling back to mock URL: ${error.message}`);
    return `/mock-recordings/${key}`;
  }
};

export const deleteS3Object = async (key) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "mock-key") {
      return true;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.warn(`S3 Delete Error: ${error.message}`);
    return true; // Return true to allow database cleanup even if S3 delete fails
  }
};
