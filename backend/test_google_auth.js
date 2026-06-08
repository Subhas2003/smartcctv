import dotenv from "dotenv";

dotenv.config();

const testGoogleLogin = async () => {
  console.log("=========================================");
  console.log("🧪 TESTING GOOGLE AUTH BACKEND ENDPOINT...");
  console.log("=========================================");

  // Create a mock JWT token payload
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    email: "test_google_user@example.com",
    name: "Google Developer Tester",
    sub: "google_oauth_sub_val_998877"
  })).toString("base64url");
  
  const mockCredential = `${header}.${payload}.signature`;

  try {
    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ credential: mockCredential })
    });

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Google Sign-In Test PASSED!");
      console.log("Status Code:", res.status);
      console.log("User Profile Created/Retrieved:\n", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ Google Sign-In Test FAILED!");
      console.error("Status Code:", res.status);
      console.error("Server Response:", data);
    }
  } catch (err) {
    console.error("❌ Network/Connection Error:", err.message);
  }
};

testGoogleLogin();
