import dotenv from "dotenv";
import { getRecordings, getRecordingUrl } from "./controllers/recordingController.js";
import dns from "dns";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Mock request and response objects
const runTest = async () => {
  console.log("=========================================");
  console.log("🚀 TESTING STATELESS S3 DIRECT INTEGRATION...");
  console.log("=========================================");

  try {
    const mockReq = {
      query: {
        page: 1,
        limit: 5,
        sortBy: "timestamp",
        order: "desc"
      }
    };

    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
      }
    };

    const mockNext = (err) => {
      if (err) {
        throw err;
      }
    };

    console.log("Fetching recordings direct from S3...");
    await getRecordings(mockReq, mockRes, mockNext);

    if (!responseData) {
      throw new Error("No response data received from getRecordings.");
    }

    console.log("✅ Success! Received response data.");
    console.log(`- Total Recordings: ${responseData.pagination.total}`);
    console.log(`- Page: ${responseData.pagination.page} / ${responseData.pagination.pages}`);
    console.log(`- Returned recordings count: ${responseData.recordings.length}`);
    console.log(`- Total Storage Usage: ${responseData.stats.storageUsageMb} MB`);

    if (responseData.recordings.length > 0) {
      const firstRec = responseData.recordings[0];
      console.log("First Recording details:");
      console.log(`  - ID (Hex-encoded key): ${firstRec._id}`);
      console.log(`  - Filename: ${firstRec.filename}`);
      console.log(`  - S3 Key: ${firstRec.key}`);
      console.log(`  - Timestamp: ${firstRec.timestamp}`);

      // Test URL signing
      console.log("\nTesting signed URL retrieval...");
      const urlReq = {
        params: {
          id: firstRec._id
        }
      };

      let urlData = null;
      const urlRes = {
        json: (data) => {
          urlData = data;
        }
      };

      await getRecordingUrl(urlReq, urlRes, mockNext);

      if (urlData && urlData.url) {
        console.log("✅ URL signing successful.");
        console.log(`  - Signed URL: ${urlData.url.substring(0, 80)}...`);
      } else {
        throw new Error("Failed to sign URL.");
      }
    } else {
      console.log("⚠️ S3 bucket appears to contain no recordings or matches.");
    }

    console.log("\n=========================================");
    console.log("🎉 ALL STATELESS S3 TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

runTest();
