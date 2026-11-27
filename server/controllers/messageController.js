const Message = require("../Models/message");
const User = require("../Models/user");
const SwapRequest = require("../Models/swaprequest");
const Notification = require("../Models/notification");
const mongoose = require("mongoose");

// 1. Send Message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, content, swapRequestId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ msg: "Recipient ID is required" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ msg: "Message content cannot be empty" });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ msg: "You cannot message yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient user not found" });
    }

    if (recipient.isBanned) {
      return res.status(403).json({ msg: "Cannot message a suspended user" });
    }

    // Optional swap verification
    if (swapRequestId) {
      const swap = await SwapRequest.findById(swapRequestId);
      if (!swap) {
        return res.status(404).json({ msg: "Referenced swap request not found" });
      }
      const isParticipant =
        swap.fromUser.toString() === senderId.toString() ||
        swap.toUser.toString() === senderId.toString();
      if (!isParticipant) {
        return res.status(403).json({ msg: "You are not a participant in this swap" });
      }
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      swapRequestId: swapRequestId || null,
      content: content.trim(),
    });

    await message.save();

    const populated = await Message.findById(message._id)
      .populate("sender", "name avatar headline")
      .populate("recipient", "name avatar headline");

    // Send in-app notification to recipient
    const snippet = content.trim().length > 60 ? content.trim().slice(0, 60) + "..." : content.trim();
    await Notification.create({
      userId: recipientId,
      senderId: senderId,
      type: "chat_message",
      title: `New message from ${req.user.name}`,
      message: snippet,
      link: `/messages?user=${senderId}${swapRequestId ? `&swap=${swapRequestId}` : ""}`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 2. Get All Conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Aggregate distinct message partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { recipient: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", currentUserId] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipient", currentUserId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Populate user profile info for each conversation peer
    const partnerIds = conversations.map((c) => c._id);
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select("name avatar headline location ratingAverage ratingCount isProMember");

    const partnerMap = new Map();
    partners.forEach((p) => partnerMap.set(p._id.toString(), p));

    const result = conversations
      .map((c) => {
        const peer = partnerMap.get(c._id.toString());
        if (!peer) return null;
        return {
          peer,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
        };
      })
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 3. Get Full Message History with specific user
exports.getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const peer = await User.findById(userId).select(
      "name email avatar headline location ratingAverage ratingCount completedSwapsCount skillsOffered skillsNeeded"
    );

    if (!peer) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Mark incoming unread messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    // Fetch chronological thread
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .populate("sender", "name avatar headline")
      .populate("recipient", "name avatar headline")
      .sort({ createdAt: 1 });

    res.json({
      peer,
      messages,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 4. Get messages attached to a specific swap
exports.getMessagesBySwap = async (req, res) => {
  try {
    const { swapId } = req.params;
    const currentUserId = req.user._id;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    const isParticipant =
      swap.fromUser.toString() === currentUserId.toString() ||
      swap.toUser.toString() === currentUserId.toString();

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ msg: "You do not have access to this swap conversation" });
    }

    const messages = await Message.find({ swapRequestId: swapId })
      .populate("sender", "name avatar headline")
      .populate("recipient", "name avatar headline")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 5. Mark messages from user as read
exports.markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.json({ msg: "Messages marked as read", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 6. Get Total Unread Count for badge
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const unreadCount = await Message.countDocuments({
      recipient: currentUserId,
      isRead: false,
    });

    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
