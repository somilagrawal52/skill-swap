const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per swap & speed up profile review lookups
ReviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
