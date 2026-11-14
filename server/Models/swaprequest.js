const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offeredSkill: { type: String, required: true, trim: true },
    requestedSkill: { type: String, required: true, trim: true },
    exchangeType: {
      type: String,
      enum: ["direct_barter", "credit_exchange"],
      default: "direct_barter",
    },
    message: { type: String, default: "", trim: true },
    sessionNotes: { type: String, default: "", trim: true },
    meetingLink: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "completed"],
      default: "pending",
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    hasReviewFromUser: { type: Boolean, default: false },
    hasReviewToUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// High-performance compound indexes
SwapRequestSchema.index({ toUser: 1, status: 1 });
SwapRequestSchema.index({ fromUser: 1, status: 1 });
SwapRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);
