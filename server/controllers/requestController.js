const SwapRequest = require("../Models/swaprequest");
const User = require("../Models/user");
const Notification = require("../Models/notification");

// Send a swap request
exports.sendRequest = async (req, res) => {
  try {
    const { toUser, offeredSkill, requestedSkill, message } = req.body;
    if (!toUser || !offeredSkill?.trim() || !requestedSkill?.trim()) {
      return res.status(400).json({ msg: "Recipient and both skills are required" });
    }
    if (toUser === req.user.id) {
      return res.status(400).json({ msg: "You cannot send a swap request to yourself" });
    }

    const recipient = await User.findById(toUser);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient not found" });
    }

    // Check for existing pending request with same skills
    const existing = await SwapRequest.findOne({
      fromUser: req.user.id,
      toUser,
      offeredSkill: offeredSkill.trim(),
      requestedSkill: requestedSkill.trim(),
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ msg: "A pending swap request for these skills already exists" });
    }

    const swap = new SwapRequest({
      fromUser: req.user.id,
      toUser,
      offeredSkill: offeredSkill.trim(),
      requestedSkill: requestedSkill.trim(),
      message: message?.trim() || "",
    });
    await swap.save();

    // Create Notification for recipient
    const sender = await User.findById(req.user.id).select("name");
    await Notification.create({
      userId: toUser,
      senderId: req.user.id,
      type: "swap_request",
      title: "New Skill Swap Proposal",
      message: `${sender?.name || "Someone"} proposed swapping "${offeredSkill.trim()}" for your "${requestedSkill.trim()}".`,
      link: "/dashboard",
    });

    const populated = await SwapRequest.findById(swap._id)
      .populate("fromUser", "name email avatar headline ratingAverage ratingCount")
      .populate("toUser", "name email avatar headline ratingAverage ratingCount");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get incoming requests for logged-in user
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ toUser: req.user.id })
      .populate("fromUser", "name email avatar headline location ratingAverage ratingCount")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get sent requests by logged-in user
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ fromUser: req.user.id })
      .populate("toUser", "name email avatar headline location ratingAverage ratingCount")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Respond to swap request (accept/decline)
exports.respondRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // accepted / declined

    const request = await SwapRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You cannot respond to this request" });
    }
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ msg: "Status must be accepted or declined" });
    }

    request.status = status;
    await request.save();

    // Create Notification for the sender
    const responder = await User.findById(req.user.id).select("name");
    const isAccepted = status === "accepted";

    await Notification.create({
      userId: request.fromUser,
      senderId: req.user.id,
      type: isAccepted ? "swap_accepted" : "swap_declined",
      title: isAccepted ? "Swap Request Accepted! 🎉" : "Swap Request Declined",
      message: `${responder?.name || "A user"} has ${status} your swap proposal for "${request.requestedSkill}".`,
      link: "/dashboard",
    });

    const populated = await SwapRequest.findById(request._id)
      .populate("fromUser", "name email avatar headline ratingAverage ratingCount")
      .populate("toUser", "name email avatar headline ratingAverage ratingCount");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Cancel swap request (by sender)
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await SwapRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.fromUser.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only cancel your own pending requests" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Only pending requests can be cancelled" });
    }

    request.status = "cancelled";
    request.cancelledAt = new Date();
    await request.save();

    res.json({ msg: "Request cancelled successfully", request });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Mark swap as completed
exports.completeSwap = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await SwapRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    const isParticipant =
      request.fromUser.toString() === req.user.id ||
      request.toUser.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ msg: "You are not a participant in this swap" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ msg: "Only accepted active swaps can be marked as completed" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    // Increment completedSwapsCount for both users
    await User.findByIdAndUpdate(request.fromUser, { $inc: { completedSwapsCount: 1 } });
    await User.findByIdAndUpdate(request.toUser, { $inc: { completedSwapsCount: 1 } });

    // Notify the other partner
    const otherUserId = request.fromUser.toString() === req.user.id ? request.toUser : request.fromUser;
    const currentUser = await User.findById(req.user.id).select("name");

    await Notification.create({
      userId: otherUserId,
      senderId: req.user.id,
      type: "swap_completed",
      title: "Skill Swap Completed! ⭐",
      message: `${currentUser?.name || "Your partner"} marked your swap for "${request.requestedSkill}" as completed. Rate and review your experience!`,
      link: "/dashboard",
    });

    const populated = await SwapRequest.findById(request._id)
      .populate("fromUser", "name email avatar headline ratingAverage ratingCount")
      .populate("toUser", "name email avatar headline ratingAverage ratingCount");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update session notes / meeting link
exports.updateSessionNotes = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { sessionNotes, meetingLink } = req.body;

    const request = await SwapRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    const isParticipant =
      request.fromUser.toString() === req.user.id ||
      request.toUser.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ msg: "You are not a participant in this swap" });
    }

    if (sessionNotes !== undefined) request.sessionNotes = sessionNotes.trim();
    if (meetingLink !== undefined) request.meetingLink = meetingLink.trim();

    await request.save();

    const populated = await SwapRequest.findById(request._id)
      .populate("fromUser", "name email avatar headline ratingAverage ratingCount")
      .populate("toUser", "name email avatar headline ratingAverage ratingCount");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
