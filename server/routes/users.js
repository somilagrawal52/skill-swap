const router = require("express").Router();
const User = require("../Models/user");
const Skill = require("../Models/skill");
const Review = require("../Models/review");

const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");

// Get all users (community directory)
router.get("/", async (req, res) => {
  try {
    const { q, skill } = req.query;
    const filter = {};

    if (q?.trim()) {
      const escaped = escapeRegex(q.trim());
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: { $regex: regex } },
        { headline: { $regex: regex } },
        { bio: { $regex: regex } },
        { skillsOffered: { $in: [regex] } },
        { skillsNeeded: { $in: [regex] } },
      ];
    }

    if (skill?.trim()) {
      const escapedSkill = escapeRegex(skill.trim());
      filter.skillsOffered = { $regex: new RegExp(escapedSkill, "i") };
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ ratingAverage: -1, completedSwapsCount: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user public profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const skills = await Skill.find({ userId: user._id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name avatar headline")
      .sort({ createdAt: -1 });

    res.json({ user, skills, reviews });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
