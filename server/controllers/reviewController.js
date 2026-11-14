const Review = require("../Models/review");
const SwapRequest = require("../Models/swaprequest");
const User = require("../Models/user");
const Notification = require("../Models/notification");

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { swapRequestId, rating, comment } = req.body;
    if (!swapRequestId || !rating) {
      return res.status(400).json({ msg: "Swap request ID and rating are required" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ msg: "Rating must be an integer between 1 and 5" });
    }

    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    if (!["completed", "accepted"].includes(swap.status)) {
      return res.status(400).json({ msg: "Can only review an accepted or completed swap" });
    }

    const isFromUser = swap.fromUser.toString() === req.user.id;
    const isToUser = swap.toUser.toString() === req.user.id;

    if (!isFromUser && !isToUser) {
      return res.status(403).json({ msg: "You are not a participant in this swap" });
    }

    const revieweeId = isFromUser ? swap.toUser : swap.fromUser;

    // Check if already reviewed
    const existing = await Review.findOne({
      swapRequest: swapRequestId,
      reviewer: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ msg: "You have already submitted a review for this swap" });
    }

    const review = new Review({
      swapRequest: swapRequestId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating: Math.round(numRating),
      comment: comment?.trim() || "",
    });
    await review.save();

    // Update flag on swap request
    if (isFromUser) {
      swap.hasReviewFromUser = true;
    } else {
      swap.hasReviewToUser = true;
    }
    await swap.save();

    // Recalculate reviewee average rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = totalRating / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      ratingAverage: Number(avg.toFixed(1)),
      ratingCount: allReviews.length,
    });

    // Notify reviewee
    const reviewerUser = await User.findById(req.user.id).select("name");
    await Notification.create({
      userId: revieweeId,
      senderId: req.user.id,
      type: "review_received",
      title: "New Review Received! ⭐",
      message: `${reviewerUser?.name || "A partner"} left you a ${review.rating}-star review: "${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}"`,
      link: `/profile/${revieweeId}`,
    });

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name avatar headline")
      .populate("reviewee", "name avatar");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get reviews received by a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name avatar headline")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
