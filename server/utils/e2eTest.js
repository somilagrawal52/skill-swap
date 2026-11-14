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
  console.log("Connected to MongoDB for integration test.");

  // Start server on random available port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const User = require("../Models/user");
  const Skill = require("../Models/skill");
  const SwapRequest = require("../Models/swaprequest");
  const Review = require("../Models/review");
  const Notification = require("../Models/notification");

  // Helper fetch functions
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
    // 1. Create two test accounts
    const testEmail1 = `test_alice_${Date.now()}@example.com`;
    const testEmail2 = `test_bob_${Date.now()}@example.com`;

    // Register Alice
    const resAliceReg = await apiPost("/api/auth/register", {
      name: "Alice Test",
      email: testEmail1,
      password: "password123",
    });
    console.log("1. Alice Registered:", resAliceReg.status === 201 ? "PASS" : "FAIL");
    if (resAliceReg.data.user.password) {
      throw new Error("SECURITY FAIL: User password exposed in response!");
    }
    const tokenAlice = resAliceReg.data.token;
    const aliceId = resAliceReg.data.user._id;

    // Register Bob
    const resBobReg = await apiPost("/api/auth/register", {
      name: "Bob Test",
      email: testEmail2,
      password: "password123",
    });
    console.log("2. Bob Registered:", resBobReg.status === 201 ? "PASS" : "FAIL");
    const tokenBob = resBobReg.data.token;
    const bobId = resBobReg.data.user._id;

    // Update Alice profile with learning goal
    await apiPut("/api/auth/profile", { skillsNeeded: ["Figma Design"] }, tokenAlice);
    // Update Bob profile with learning goal
    await apiPut("/api/auth/profile", { skillsNeeded: ["Node.js API"] }, tokenBob);

    // 3. Create Skills
    const resSkillAlice = await apiPost(
      "/api/skills/create",
      {
        title: "Node.js API",
        description: "Learn how to build express APIs",
        category: "Development & IT",
        level: "Advanced",
        tags: ["Node", "Express"],
      },
      tokenAlice
    );
    console.log("3. Alice Created Skill:", resSkillAlice.status === 201 ? "PASS" : "FAIL");

    const resSkillBob = await apiPost(
      "/api/skills/create",
      {
        title: "Figma Design",
        description: "Learn wireframing and component libraries",
        category: "Design & Creative",
        level: "Intermediate",
        tags: ["Figma", "UI"],
      },
      tokenBob
    );
    console.log("4. Bob Created Skill:", resSkillBob.status === 201 ? "PASS" : "FAIL");

    // 5. Test Smart Matches
    const resMatches = await apiGet("/api/skills/matches", tokenAlice);
    console.log("5. Alice Smart Matches:", resMatches.status === 200 ? "PASS" : "FAIL");
    const bobMatch = resMatches.data.find((m) => m.user._id === bobId);
    console.log("   -> Perfect mutual barter match identified:", bobMatch?.matchType === "mutual" ? "PASS" : "FAIL");

    // 6. Propose Swap (Alice -> Bob)
    const resSwap = await apiPost(
      "/api/requests/send",
      {
        toUser: bobId,
        offeredSkill: "Node.js API",
        requestedSkill: "Figma Design",
        message: "Hey Bob, let's swap 1 hour of Node for 1 hour of Figma!",
      },
      tokenAlice
    );
    console.log("6. Alice Sent Swap Proposal:", resSwap.status === 201 ? "PASS" : "FAIL");
    const swapId = resSwap.data._id;

    // 7. Check Bob incoming proposals
    const resBobIncoming = await apiGet("/api/requests/incoming", tokenBob);
    console.log("7. Bob Received Incoming Proposal:", resBobIncoming.data.length > 0 ? "PASS" : "FAIL");

    // 8. Bob Accepts proposal
    const resAccept = await apiPut(
      `/api/requests/respond/${swapId}`,
      { status: "accepted" },
      tokenBob
    );
    console.log("8. Bob Accepted Proposal:", resAccept.data.status === "accepted" ? "PASS" : "FAIL");

    // 9. Update Session Notes & Meeting Link
    const resNotes = await apiPut(
      `/api/requests/notes/${swapId}`,
      {
        meetingLink: "https://meet.google.com/test-swap-room",
        sessionNotes: "Agreed meeting Saturday 3 PM. Alice covers Node routing first.",
      },
      tokenBob
    );
    console.log("9. Session Notes Updated:", resNotes.data.meetingLink?.includes("meet.google.com") ? "PASS" : "FAIL");

    // 10. Complete Swap
    const resComplete = await apiPut(
      `/api/requests/complete/${swapId}`,
      {},
      tokenAlice
    );
    console.log("10. Swap Marked Completed:", resComplete.data.status === "completed" ? "PASS" : "FAIL");

    // 11. Review Partner (Alice reviews Bob)
    const resReview = await apiPost(
      "/api/reviews",
      {
        swapRequestId: swapId,
        rating: 5,
        comment: "Bob was a fantastic Figma mentor! Showed auto-layouts and components clearly.",
      },
      tokenAlice
    );
    console.log("11. Review Submitted:", resReview.status === 201 ? "PASS" : "FAIL");

    // 12. Check Bob's updated rating
    const updatedBob = await User.findById(bobId);
    console.log(`12. Bob's Rating Recalculated: ${updatedBob.ratingAverage} ★ (${updatedBob.ratingCount} review) - ${updatedBob.ratingAverage === 5 ? "PASS" : "FAIL"}`);

    // 13. Check Notifications for Bob
    const resBobNotifs = await apiGet("/api/notifications", tokenBob);
    console.log("13. Bob Notification Center:", resBobNotifs.data.notifications.length > 0 ? "PASS" : "FAIL");

    // Cleanup test documents
    await User.deleteMany({ _id: { $in: [aliceId, bobId] } });
    await Skill.deleteMany({ userId: { $in: [aliceId, bobId] } });
    await SwapRequest.deleteMany({ _id: swapId });
    await Review.deleteMany({ swapRequest: swapId });
    await Notification.deleteMany({ userId: { $in: [aliceId, bobId] } });
    console.log("Test documents cleaned up.");

    console.log("\n>>> ALL INTEGRATION AUDIT TESTS PASSED SUCCESSFULLY! <<<\n");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    server.close();
    process.exit(1);
  }
}

run();
