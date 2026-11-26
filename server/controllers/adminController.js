const User = require("../Models/user");
const Skill = require("../Models/skill");
const SwapRequest = require("../Models/swaprequest");
const Review = require("../Models/review");
const Notification = require("../Models/notification");

const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");

// 1. Platform KPIs & Metrics
exports.getPlatformMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalSkills,
      featuredSkills,
      flaggedSkills,
      totalSwaps,
      completedSwaps,
      acceptedSwaps,
      pendingSwaps,
      declinedSwaps,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: false }),
      User.countDocuments({ isBanned: true }),
      Skill.countDocuments(),
      Skill.countDocuments({ isFeatured: true }),
      Skill.countDocuments({ status: "flagged" }),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "completed" }),
      SwapRequest.countDocuments({ status: "accepted" }),
      SwapRequest.countDocuments({ status: "pending" }),
      SwapRequest.countDocuments({ status: "declined" }),
      Review.countDocuments(),
    ]);

    // Aggregate circulating credits
    const creditAgg = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: "$credits" } } },
    ]);
    const circulatingCredits = creditAgg[0]?.totalCredits || 0;

    // Aggregate category distribution
    const categoryDistribution = await Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Aggregate average review rating
    const ratingAgg = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const averageRating = ratingAgg[0]?.avgRating ? Number(ratingAgg[0].avgRating.toFixed(2)) : 5.0;

    // Recent swap activity
    const recentSwaps = await SwapRequest.find()
      .populate("fromUser", "name email avatar")
      .populate("toUser", "name email avatar")
      .populate("offeredSkill", "title category")
      .populate("requestedSkill", "title category")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalSkills,
        featuredSkills,
        flaggedSkills,
        totalSwaps,
        completedSwaps,
        acceptedSwaps,
        pendingSwaps,
        declinedSwaps,
        totalReviews,
        circulatingCredits,
        averageRating,
        completionRatePct: totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0,
      },
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c._id || "Uncategorized",
        count: c.count,
      })),
      recentSwaps,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 2. User Management
exports.getUsers = async (req, res) => {
  try {
    const { q, role, isBanned } = req.query;
    const filter = {};

    if (q?.trim()) {
      const escaped = escapeRegex(q.trim());
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: { $regex: regex } }, { email: { $regex: regex } }];
    }

    if (role) filter.role = role;
    if (isBanned !== undefined && isBanned !== "") filter.isBanned = isBanned === "true";

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Toggle User Ban
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { banReason } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ msg: "You cannot suspend your own administrator account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? banReason?.trim() || "Suspended by administrator for policy violation" : "";
    await user.save();

    res.json({
      msg: user.isBanned ? "User suspended successfully" : "User ban lifted successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Adjust User Credits
exports.adjustUserCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ msg: "A valid numeric amount is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.credits = Math.max(0, user.credits + numAmount);
    await user.save();

    // Send in-app notification to the user
    await Notification.create({
      userId: user._id,
      type: "credit_update",
      title: "Credit Balance Adjusted by Admin",
      message: `${numAmount >= 0 ? "+" : ""}${numAmount} Credits: ${reason?.trim() || "Administrative adjustment"}. New balance: ${user.credits} Credits.`,
      link: "/dashboard",
    });

    res.json({
      msg: `Credits adjusted. New balance: ${user.credits}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Toggle User Role (user <-> admin)
exports.toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role specified" });
    }

    if (id === req.user._id.toString() && role !== "admin") {
      return res.status(400).json({ msg: "You cannot demote your own admin account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ msg: `User role changed to ${role}`, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 3. Skill Moderation
exports.getSkills = async (req, res) => {
  try {
    const { q, category, status, isFeatured } = req.query;
    const filter = {};

    if (q?.trim()) {
      const escaped = escapeRegex(q.trim());
      filter.$or = [
        { title: { $regex: new RegExp(escaped, "i") } },
        { description: { $regex: new RegExp(escaped, "i") } },
      ];
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isFeatured !== undefined && isFeatured !== "") filter.isFeatured = isFeatured === "true";

    const skills = await Skill.find(filter)
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Toggle Skill Featured Status
exports.toggleSkillFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    skill.isFeatured = !skill.isFeatured;
    await skill.save();

    res.json({
      msg: skill.isFeatured ? "Skill featured on platform homepage" : "Skill removed from featured list",
      skill,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update Skill Moderation Status
exports.updateSkillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "flagged", "archived"].includes(status)) {
      return res.status(400).json({ msg: "Invalid skill status" });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    skill.status = status;
    await skill.save();

    res.json({ msg: `Skill status set to ${status}`, skill });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    res.json({ msg: "Skill permanently removed from marketplace" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 4. Swap Oversight & Disputes
exports.getSwaps = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const swaps = await SwapRequest.find(filter)
      .populate("fromUser", "name email avatar")
      .populate("toUser", "name email avatar")
      .populate("offeredSkill", "title category")
      .populate("requestedSkill", "title category")
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Dispute Resolution / Force State
exports.resolveSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, notes } = req.body; // resolution: "force_complete" | "force_cancel"

    const swap = await SwapRequest.findById(id)
      .populate("fromUser")
      .populate("toUser");

    if (!swap) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    if (resolution === "force_complete") {
      swap.status = "completed";
      swap.sessionNotes = `${swap.sessionNotes || ""}\n[Admin Resolution]: Manually marked complete. ${notes || ""}`.trim();
      await swap.save();

      // Process credit accounting if credit exchange
      if (swap.exchangeType === "credit_exchange") {
        await User.findByIdAndUpdate(swap.toUser._id, { $inc: { credits: 1 } });
      }

      await User.findByIdAndUpdate(swap.fromUser._id, { $inc: { completedSwapsCount: 1 } });
      await User.findByIdAndUpdate(swap.toUser._id, { $inc: { completedSwapsCount: 1 } });
    } else if (resolution === "force_cancel") {
      swap.status = "cancelled";
      swap.sessionNotes = `${swap.sessionNotes || ""}\n[Admin Resolution]: Manually cancelled. ${notes || ""}`.trim();
      await swap.save();

      // Refund credit to requester if credit exchange
      if (swap.exchangeType === "credit_exchange") {
        await User.findByIdAndUpdate(swap.fromUser._id, { $inc: { credits: 1 } });
      }
    } else {
      return res.status(400).json({ msg: "Resolution must be force_complete or force_cancel" });
    }

    res.json({ msg: `Swap resolved as ${resolution}`, swap });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
