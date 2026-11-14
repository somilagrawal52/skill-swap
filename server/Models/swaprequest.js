const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offeredSkill: { type: String, required: true, trim: true },
    requestedSkill: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);
