const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offeredSkill: { type: String, required: true },
  requestedSkill: { type: String, required: true },
  status: { type: String, default: "pending" } // pending, accepted, declined
}, { timestamps: true });

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);