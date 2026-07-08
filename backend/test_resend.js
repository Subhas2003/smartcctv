import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const email = process.env.SMTP_USER || "smartcctv.official2026@gmail.com";

console.log("Checking Resend API configuration...");
console.log("API Key present:", apiKey ? "Yes (starts with " + apiKey.substring(0, 7) + "...)" : "No");

async function testResend() {
  if (!apiKey) {
    console.error("❌ Missing RESEND_API_KEY in .env");
    return;
  }

  try {
    console.log("Sending test email via Resend HTTP API to:", email);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `"Smart CCTV System" <onboarding@resend.dev>`,
        to: [email],
        subject: "Test Email from Smart CCTV via Resend",
        html: "<p>If you received this, your Resend API is working perfectly on port 443!</p>",
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Resend Email sent successfully!");
      console.log("Response:", data);
    } else {
      console.error("❌ Resend API failed with error:");
      console.error(data);
    }
  } catch (error) {
    console.error("❌ Network Error sending request:", error.message);
  }
}

testResend();
