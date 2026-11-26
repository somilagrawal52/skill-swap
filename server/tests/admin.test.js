// Integration Test Suite for SkillSwap Admin Control Center
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const authRoutes = require("../routes/auth");
const adminRoutes = require("../routes/admin");
const skillRoutes = require("../routes/skills");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skills", skillRoutes);

async function runAdminTests() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap");
  console.log("Connected to MongoDB for admin test suite...");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const User = require("../Models/user");
  const Skill = require("../Models/skill");
  const SwapRequest = require("../Models/swaprequest");

  const apiGet = async (path, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  const apiPatch = async (path, body, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  const apiPost = async (path, body, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    console.log("Running Admin Security & Operation Tests...");

    // Setup: Create a regular user and an admin user
    await User.deleteMany({ email: { $in: ["testregular@test.io", "testadmin@test.io", "bannedtarget@test.io"] } });

    const hashedPassword = await bcrypt.hash("password123", 10);

    const regularUser = await User.create({
      name: "Test Regular User",
      email: "testregular@test.io",
      password: hashedPassword,
      role: "user",
      credits: 3,
    });

    const adminUser = await User.create({
      name: "Test Admin User",
      email: "testadmin@test.io",
      password: hashedPassword,
      role: "admin",
      credits: 99,
    });

    const bannedTarget = await User.create({
      name: "Target For Ban",
      email: "bannedtarget@test.io",
      password: hashedPassword,
      role: "user",
      credits: 5,
    });

    const regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET);
    const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);

    // Test 1: Unauthenticated request to /api/admin/metrics returns 401
    const unauthRes = await apiGet("/api/admin/metrics");
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated admin access, got ${unauthRes.status}`);
    }
    console.log("  ✓ Unauthenticated requests rejected with 401");

    // Test 2: Regular user request to /api/admin/metrics returns 403 Forbidden
    const forbiddenRes = await apiGet("/api/admin/metrics", regularToken);
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 for non-admin user access, got ${forbiddenRes.status}`);
    }
    console.log("  ✓ Non-admin regular user rejected with 403 Forbidden");

    // Test 3: Admin user request to /api/admin/metrics returns 200 with platform metrics
    const metricsRes = await apiGet("/api/admin/metrics", adminToken);
    if (metricsRes.status !== 200 || !metricsRes.data.overview) {
      throw new Error(`Expected 200 with metrics overview, got ${metricsRes.status}`);
    }
    if (typeof metricsRes.data.overview.totalUsers !== "number") {
      throw new Error("Expected totalUsers in overview metrics");
    }
    console.log("  ✓ Admin can retrieve platform KPIs & metrics (totalUsers:", metricsRes.data.overview.totalUsers, ")");

    // Test 4: Admin lists users
    const usersRes = await apiGet("/api/admin/users", adminToken);
    if (usersRes.status !== 200 || !Array.isArray(usersRes.data)) {
      throw new Error("Failed to list users");
    }
    console.log("  ✓ Admin can search and list all platform users");

    // Test 5: Admin adjusts user credits
    const creditRes = await apiPatch(`/api/admin/users/${bannedTarget._id}/credits`, { amount: 10, reason: "Test bonus" }, adminToken);
    if (creditRes.status !== 200 || creditRes.data.user.credits !== 15) {
      throw new Error(`Credit adjustment failed: expected 15, got ${creditRes.data.user?.credits}`);
    }
    console.log("  ✓ Admin can adjust user credits (+10 applied, new balance: 15)");

    // Test 6: Admin suspends (bans) user
    const banRes = await apiPatch(`/api/admin/users/${bannedTarget._id}/ban`, { banReason: "Violation of test rules" }, adminToken);
    if (banRes.status !== 200 || !banRes.data.user.isBanned) {
      throw new Error("Failed to ban target user");
    }
    console.log("  ✓ Admin can suspend user account");

    // Test 7: Suspended user is blocked from logging in
    const loginAttempt = await apiPost("/api/auth/login", { email: "bannedtarget@test.io", password: "password123" });
    if (loginAttempt.status !== 403) {
      throw new Error(`Expected 403 on login for banned user, got ${loginAttempt.status}`);
    }
    console.log("  ✓ Suspended user blocked from login with 403 and reason banner");

    // Test 8: Admin creates a skill, toggles featured, and updates status
    const testSkill = await Skill.create({
      title: "Admin Moderation Test Skill",
      description: "Testing moderation features",
      category: "Development & IT",
      level: "Intermediate",
      userId: adminUser._id,
    });

    const featRes = await apiPatch(`/api/admin/skills/${testSkill._id}/feature`, {}, adminToken);
    if (featRes.status !== 200 || !featRes.data.skill.isFeatured) {
      throw new Error("Toggle featured skill failed");
    }
    console.log("  ✓ Admin can toggle skill featured badge");

    const statusRes = await apiPatch(`/api/admin/skills/${testSkill._id}/status`, { status: "flagged" }, adminToken);
    if (statusRes.status !== 200 || statusRes.data.skill.status !== "flagged") {
      throw new Error("Update skill status failed");
    }
    console.log("  ✓ Admin can flag/moderate marketplace skills");

    // Clean up test data
    await User.deleteMany({ email: { $in: ["testregular@test.io", "testadmin@test.io", "bannedtarget@test.io"] } });
    await Skill.findByIdAndDelete(testSkill._id);

    console.log("✅ All Admin Command Center tests passed successfully (100% assertions satisfied).");
  } finally {
    server.close();
    await mongoose.connection.close(false);
  }
}

runAdminTests().catch((err) => {
  console.error("❌ Admin test suite failed:", err);
  process.exit(1);
});
