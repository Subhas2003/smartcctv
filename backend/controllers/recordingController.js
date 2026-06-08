import { getDownloadUrl, deleteS3Object } from "../services/awsService.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "cctvproject2026";

// @desc    Get recordings list
// @route   GET /api/recordings
// @access  Private
export const getRecordings = async (req, res, next) => {
  try {
    const {
      search,
      sortBy = "timestamp",
      order = "desc",
      page = 1,
      limit = 9,
    } = req.query;

    let allItems = [];

    // Check if AWS S3 is mock or not configured
    const isMockS3 = !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "mock-key";

    if (isMockS3) {
      const startOfToday = new Date();
      allItems = [
        {
          key: "recordings/recording_fire_test_01.mp4",
          filename: "recording_fire_test_01.mp4",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          duration: 10,
          size: 1024 * 1024 * 3.5,
          timestamp: new Date(startOfToday.getTime() - 3600000 * 2),
          cameraId: "cam_1",
          cameraName: "Main Camera",
        },
        {
          key: "recordings/recording_motion_02.mp4",
          filename: "recording_motion_02.mp4",
          url: "https://www.w3schools.com/html/movie.mp4",
          duration: 12,
          size: 1024 * 1024 * 4.2,
          timestamp: new Date(startOfToday.getTime() - 3600000 * 5),
          cameraId: "cam_1",
          cameraName: "Main Camera",
        },
        {
          key: "recordings/recording_smoke_test_03.mp4",
          filename: "recording_smoke_test_03.mp4",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          duration: 15,
          size: 1024 * 1024 * 5.1,
          timestamp: new Date(startOfToday.getTime() - 86400000),
          cameraId: "cam_1",
          cameraName: "Main Camera",
        }
      ];
    } else {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      });
      const response = await s3Client.send(command);

      if (response.Contents && response.Contents.length > 0) {
        allItems = response.Contents
          .filter((item) => item.Key.endsWith(".mp4") && item.Size > 1024)
          .map((item) => {
            const parts = item.Key.split("/");
            const filename = parts.length > 1 ? `${parts[0]}_${parts[1]}` : item.Key;
            return {
              key: item.Key,
              filename,
              url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${item.Key}`,
              duration: 30, // Default approximation
              size: item.Size,
              timestamp: item.LastModified || new Date(),
              cameraId: "cam_1",
              cameraName: "Main Camera",
            };
          });
      }
    }

    // Dynamic dynamic hex _id based on S3 key
    allItems = allItems.map((item) => ({
      ...item,
      _id: Buffer.from(item.key).toString("hex"),
    }));

    // 1. Search Filter
    let filtered = allItems;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = allItems.filter((item) =>
        item.filename.toLowerCase().includes(searchLower)
      );
    }

    // 2. Sorting
    filtered.sort((a, b) => {
      let fieldA = a[sortBy];
      let fieldB = b[sortBy];

      if (sortBy === "timestamp") {
        fieldA = new Date(a.timestamp).getTime();
        fieldB = new Date(b.timestamp).getTime();
      }

      if (fieldA < fieldB) return order === "desc" ? 1 : -1;
      if (fieldA > fieldB) return order === "desc" ? -1 : 1;
      return 0;
    });

    // 3. Pagination
    const total = filtered.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const recordings = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Total storage usage MB
    const totalSize = allItems.reduce((acc, item) => acc + item.size, 0);

    res.json({
      recordings,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      stats: {
        total,
        storageUsageMb: Number((totalSize / (1024 * 1024)).toFixed(2)),
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signed URL for recording download/viewing
// @route   GET /api/recordings/:id/url
// @access  Private
export const getRecordingUrl = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    // Decode the key from the hex ID
    let key;
    try {
      key = Buffer.from(id, "hex").toString("utf-8");
    } catch (err) {
      return res.status(400).json({ message: "Invalid recording ID" });
    }

    const signedUrl = await getDownloadUrl(key);
    res.json({ url: signedUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recording
// @route   DELETE /api/recordings/:id
// @access  Private
export const deleteRecording = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    // Decode the key from the hex ID
    let key;
    try {
      key = Buffer.from(id, "hex").toString("utf-8");
    } catch (err) {
      return res.status(400).json({ message: "Invalid recording ID" });
    }

    // Delete from S3
    await deleteS3Object(key);

    res.json({ message: "Recording deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger/Register new recording
// @route   POST /api/recordings/trigger
// @access  Public
export const triggerRecording = async (req, res, next) => {
  try {
    res.status(201).json({ message: "Recording upload detected (stateless)" });
  } catch (error) {
    next(error);
  }
};
