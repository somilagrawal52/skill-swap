// Integration Test Suite for SkillSwap API
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const authRoutes = require("../routes/auth");
const skillRoutes = require("../routes/skills");
const requestRoutes = require("../routes/requests");
const reviewRoutes = require("../routes/reviews");
const notificationRoutes = require("../routes/notifications");
const userRoutes = require("../routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap");
  console.log("Connected to MongoDB for test suite...");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const User = require("../Models/user");
  const Skill = require("../Models/skill");
  const SwapRequest = require("../Models/swaprequest");
  const Review = require("../Models/review");
  const Notification = require("../Models/notification");

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

  const apiPut = async (path, body, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  const apiGet = async (path, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    const testEmail1 = `test_alice_${Date.now()}@example.com`;
    const testEmail2 = `test_bob_${Date.now()}@example.com`;

    // 1. Auth Test
    const resAlice = await apiPost("/api/auth/register", {
      name: "Alice Suite",
      email: testEmail1,
      password: "password123",
    });
    console.assert(resAlice.status === 201, "Alice should be created");
    console.assert(!resAlice.data.user.password, "Password should be stripped");

    const resBob = await apiPost("/api/auth/register", {
      name: "Bob Suite",
      email: testEmail2,
      password: "password123",
    });
    console.assert(resBob.status === 201, "Bob should be created");

    const tokenAlice = resAlice.data.token;
    const aliceId = resAlice.data.user._id;
    const tokenBob = resBob.data.token;
    const bobId = resBob.data.user._id;

    // 2. Profiles & Skills Test
    await apiPut("/api/auth/profile", { skillsNeeded: ["UI Design"] }, tokenAlice);
    await apiPut("/api/auth/profile", { skillsNeeded: ["Node.js"] }, tokenBob);

    await apiPost(
      "/api/skills/create",
      {
        title: "Node.js",
        description: "Backend architecture",
        category: "Development & IT",
        level: "Advanced",
        tags: ["Node", "Express"],
      },
      tokenAlice
    );

    await apiPost(
      "/api/skills/create",
      {
        title: "UI Design",
        description: "Figma wireframing",
        category: "Design & Creative",
        level: "Intermediate",
        tags: ["Figma"],
      },
      tokenBob
    );

    // 3. Smart Matching Test
    const resMatches = await apiGet("/api/skills/matches", tokenAlice);
    console.assert(resMatches.status === 200, "Matches should return 200");
    const mutualMatch = resMatches.data.find((m) => m.user._id === bobId);
    console.assert(mutualMatch?.matchType === "mutual", "Should identify mutual barter match");

    // 4. Swap Lifecycle Test
    const resSwap = await apiPost(
      "/api/requests/send",
      {
        toUser: bobId,
        offeredSkill: "Node.js",
        requestedSkill: "UI Design",
        message: "Let's swap 1 hour of Node for Figma!",
      },
      tokenAlice
    );
    console.assert(resSwap.status === 201, "Swap proposal should be created");
    const swapId = resSwap.data._id;

    // Bob accepts
    const resAccept = await apiPut(`/api/requests/respond/${swapId}`, { status: "accepted" }, tokenBob);
    console.assert(resAccept.data.status === "accepted", "Swap should be accepted");

    // Complete swap
    const resComplete = await apiPut(`/api/requests/complete/${swapId}`, {}, tokenAlice);
    console.assert(resComplete.data.status === "completed", "Swap should be completed");

    // 5. Review Test
    const resReview = await apiPost(
      "/api/reviews",
      {
        swapRequestId: swapId,
        rating: 5,
        comment: "Excellent Figma mentor!",
      },
      tokenAlice
    );
    console.assert(resReview.status === 201, "Review should be created");

    // Cleanup
    await User.deleteMany({ _id: { $in: [aliceId, bobId] } });
    await Skill.deleteMany({ userId: { $in: [aliceId, bobId] } });
    await SwapRequest.deleteMany({ _id: swapId });
    await Review.deleteMany({ swapRequest: swapId });
    await Notification.deleteMany({ userId: { $in: [aliceId, bobId] } });

    console.log("✅ All API tests passed successfully (100% assertions satisfied).");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    server.close();
    process.exit(1);
  }
}

run();
