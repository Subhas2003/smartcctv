import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const users = await User.find({});
  console.log(`Found ${users.length} users in the database:`);
  users.forEach((u) => {
    console.log(`- Email: ${u.email}, Name: ${u.name}, Verified: ${u.isVerified}, Google: ${!!u.googleId}`);
  });

  // Check if test user exists
  const testEmail = "test@example.com";
  await User.deleteOne({ email: testEmail });
  console.log("Deleted old test user to prevent double-hashing.");

  console.log(`\nCreating a pre-verified test user: ${testEmail}...`);
  const testUser = await User.create({
    name: "Test User",
    email: testEmail,
    password: "password123",
    isVerified: true,
    verificationOtp: null,
    verificationOtpExpires: null,
  });
  console.log(`Pre-verified test user created:`, testUser);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
};

run().catch((err) => {
  console.error("Error running script:", err);
  mongoose.disconnect();
});
