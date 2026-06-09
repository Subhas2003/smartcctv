import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const url = `http://localhost:${PORT}/api/alerts/fire`;

// Fire alert payload
const payload = {
  cameraId: "cam_1",
  type: "fire",
  confidence: 98
};

console.log(`Sending simulated Fire Alert to ${url}...`);

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (response.ok) {
    console.log("🔥 Fire alert triggered successfully!");
    console.log("Response:", data);
    console.log("This alert should now appear in real-time on your frontend dashboard!");
  } else {
    console.error("❌ Failed to trigger alert:", data);
  }
} catch (error) {
  console.error("❌ Error sending request:", error.message);
  console.error(`Ensure your backend server is running on port ${PORT} by running 'npm run dev' or 'npm start'.`);
}
