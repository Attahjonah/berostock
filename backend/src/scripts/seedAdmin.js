const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); 
require("dotenv").config();

// Get email and password from command-line args
const [,, emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error("Usage: node seedAdmin.js <email> <password>");
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const existingAdmin = await User.findOne({ email: emailArg });
    if (existingAdmin) {
      console.log("Admin already exists with this email.");
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(passwordArg, 10);

    const admin = new User({
      firstName: "Super",
      lastName: "Admin",
      email: emailArg,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log(`✅ Admin user (${emailArg}) created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create admin user:", err);
    process.exit(1);
  }
};

createAdmin();
