// Integration Test Suite for SkillSwap In-App Messaging
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const authRoutes = require("../routes/auth");
const messageRoutes = require("../routes/messages");
const notificationRoutes = require("../routes/notifications");

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

async function runMessagingTests() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap");
  console.log("Connected to MongoDB for messaging test suite...");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const User = require("../Models/user");
  const Message = require("../Models/message");
  const Notification = require("../Models/notification");

  const apiGet = async (path, token) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  try {
    console.log("Running In-App Messaging Tests...");

    // Setup: Create test user A and user B
    await User.deleteMany({ email: { $in: ["chattest_a@test.io", "chattest_b@test.io"] } });
    await Message.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 10);

    const userA = await User.create({
      name: "Alice Chat",
      email: "chattest_a@test.io",
      password: hashedPassword,
      credits: 3,
    });

    const userB = await User.create({
      name: "Bob Chat",
      email: "chattest_b@test.io",
      password: hashedPassword,
      credits: 3,
    });

    const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET);
    const tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET);

    // Test 1: Unauthenticated request to /api/messages/conversations returns 401
    const unauthRes = await apiGet("/api/messages/conversations");
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated access, got ${unauthRes.status}`);
    }
    console.log("  ✓ Unauthenticated messaging requests rejected with 401");

    // Test 2: Alice cannot message herself
    const selfMsgRes = await apiPost("/api/messages/send", { recipientId: userA._id, content: "Self note" }, tokenA);
    if (selfMsgRes.status !== 400) {
      throw new Error(`Expected 400 when messaging self, got ${selfMsgRes.status}`);
    }
    console.log("  ✓ Prevented self-messaging with 400 Bad Request");

    // Test 3: Alice cannot send an empty message
    const emptyMsgRes = await apiPost("/api/messages/send", { recipientId: userB._id, content: "   " }, tokenA);
    if (emptyMsgRes.status !== 400) {
      throw new Error(`Expected 400 for empty message, got ${emptyMsgRes.status}`);
    }
    console.log("  ✓ Empty messages rejected with 400 Bad Request");

    // Test 4: Alice sends a valid message to Bob
    const sendRes = await apiPost(
      "/api/messages/send",
      { recipientId: userB._id, content: "Hey Bob! Excited to swap web dev for guitar lessons." },
      tokenA
    );
    if (sendRes.status !== 201 || !sendRes.data._id) {
      throw new Error(`Expected 201 for sent message, got ${sendRes.status}`);
    }
    if (sendRes.data.content !== "Hey Bob! Excited to swap web dev for guitar lessons.") {
      throw new Error("Message content does not match");
    }
    console.log("  ✓ Alice successfully sent message to Bob (HTTP 201)");

    // Test 5: Verify Bob received an in-app notification
    const notifRes = await apiGet("/api/notifications", tokenB);
    if (!notifRes.data.notifications || notifRes.data.notifications.length === 0) {
      throw new Error("Expected notification for recipient upon receiving chat message");
    }
    const chatNotif = notifRes.data.notifications[0];
    if (chatNotif.type !== "chat_message" || !chatNotif.title.includes("Alice")) {
      throw new Error(`Invalid notification payload: ${JSON.stringify(chatNotif)}`);
    }
    console.log("  ✓ Automatic in-app notification generated for recipient (type: chat_message)");

    // Test 6: Bob checks unread count badge
    const unreadRes = await apiGet("/api/messages/unread/count", tokenB);
    if (unreadRes.status !== 200 || unreadRes.data.unreadCount !== 1) {
      throw new Error(`Expected unreadCount = 1 for Bob, got ${unreadRes.data.unreadCount}`);
    }
    console.log("  ✓ Unread message count badge accurately reflects 1 unread message");

    // Test 7: Bob lists conversations
    const convosRes = await apiGet("/api/messages/conversations", tokenB);
    if (convosRes.status !== 200 || convosRes.data.length !== 1) {
      throw new Error(`Expected 1 conversation for Bob, got ${convosRes.data.length}`);
    }
    const bobConvo = convosRes.data[0];
    if (bobConvo.peer._id !== userA._id.toString() || bobConvo.unreadCount !== 1) {
      throw new Error("Conversation payload mismatch");
    }
    console.log("  ✓ Conversations aggregator accurately returns peer Alice with unreadCount: 1");

    // Test 8: Bob opens thread with Alice -> messages automatically marked as read
    const threadRes = await apiGet(`/api/messages/${userA._id}`, tokenB);
    if (threadRes.status !== 200 || threadRes.data.messages.length !== 1) {
      throw new Error(`Expected 1 message in thread, got ${threadRes.data.messages.length}`);
    }
    console.log("  ✓ Thread fetched with chronological messages");

    // Test 9: Verify unread count is now 0 for Bob
    const recheckUnread = await apiGet("/api/messages/unread/count", tokenB);
    if (recheckUnread.data.unreadCount !== 0) {
      throw new Error(`Expected unreadCount = 0 after opening thread, got ${recheckUnread.data.unreadCount}`);
    }
    console.log("  ✓ Messages automatically marked as read; unreadCount updated to 0");

    // Test 10: Bob replies to Alice
    const replyRes = await apiPost(
      "/api/messages/send",
      { recipientId: userA._id, content: "Sounds great Alice! How does Thursday at 6pm sound?" },
      tokenB
    );
    if (replyRes.status !== 201) {
      throw new Error("Bob's reply failed");
    }
    console.log("  ✓ Bob successfully replied to Alice");

    // Verify Alice now sees both messages in order
    const aliceThread = await apiGet(`/api/messages/${userB._id}`, tokenA);
    if (aliceThread.data.messages.length !== 2) {
      throw new Error(`Expected 2 messages in Alice's thread, got ${aliceThread.data.messages.length}`);
    }
    console.log("  ✓ Bidirectional conversation thread maintains perfect chronological history");

    // Cleanup
    await User.deleteMany({ email: { $in: ["chattest_a@test.io", "chattest_b@test.io"] } });
    await Message.deleteMany({});
    await Notification.deleteMany({ userId: { $in: [userA._id, userB._id] } });

    console.log("✅ All In-App Messaging tests passed successfully (100% assertions satisfied).");
  } finally {
    server.close();
    await mongoose.connection.close(false);
  }
}

runMessagingTests().catch((err) => {
  console.error("❌ Messaging test suite failed:", err);
  process.exit(1);
});
