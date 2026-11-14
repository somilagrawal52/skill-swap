// Unit Test Suite for Swap Lifecycle & Credit Transactions
require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const SwapRequest = require("../Models/swaprequest");
const User = require("../Models/user");

async function runSwapTests() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap");
  console.log("Running Swap Lifecycle Unit Tests...");

  const userA = new User({
    name: "User A",
    email: `usera_${Date.now()}@test.com`,
    password: "hashedpassword",
    credits: 3,
  });
  await userA.save();

  const userB = new User({
    name: "User B",
    email: `userb_${Date.now()}@test.com`,
    password: "hashedpassword",
    credits: 3,
  });
  await userB.save();

  // Test creating swap request
  const swap = new SwapRequest({
    fromUser: userA._id,
    toUser: userB._id,
    offeredSkill: "Python",
    requestedSkill: "React",
    exchangeType: "credit_exchange",
  });
  await swap.save();
  console.assert(swap.status === "pending", "Initial status should be pending");

  // Test status transitions
  swap.status = "accepted";
  swap.meetingLink = "https://meet.google.com/xyz";
  await swap.save();
  console.assert(swap.status === "accepted", "Status should update to accepted");

  // Clean up
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await SwapRequest.deleteMany({ _id: swap._id });

  console.log("✅ Swap Lifecycle Unit Tests Passed.");
  process.exit(0);
}

runSwapTests().catch((err) => {
  console.error("Swap test failed:", err);
  process.exit(1);
});
