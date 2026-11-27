const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    swapRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for fast inbox sorting & conversation retrieval
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ swapRequestId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
