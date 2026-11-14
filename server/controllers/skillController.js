const Skill = require("../Models/skill");
const User = require("../Models/user");

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { title, description, category, level, tags } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ msg: "Skill title is required" });
    }

    const skill = new Skill({
      title: title.trim(),
      description: description?.trim() || "",
      category: category || "Development & IT",
      level: level || "Intermediate",
      tags: Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      userId: req.user.id,
    });

    await skill.save();

    // Sync into user's skillsOffered
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { skillsOffered: skill.title },
    });

    const populatedSkill = await Skill.findById(skill._id).populate(
      "userId",
      "name email avatar headline ratingAverage ratingCount"
    );

    res.status(201).json(populatedSkill);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update an existing skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, level, tags } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    if (skill.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only edit your own skills" });
    }

    const oldTitle = skill.title;

    if (title?.trim()) skill.title = title.trim();
    if (description !== undefined) skill.description = description.trim();
    if (category) skill.category = category;
    if (level) skill.level = level;
    if (tags !== undefined) {
      skill.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    await skill.save();

    // Update user's skillsOffered if title changed
    if (oldTitle !== skill.title) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { skillsOffered: oldTitle },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { skillsOffered: skill.title },
      });
    }

    const populatedSkill = await Skill.findById(skill._id).populate(
      "userId",
      "name email avatar headline ratingAverage ratingCount"
    );

    res.json(populatedSkill);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    if (skill.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only delete your own skills" });
    }

    const skillTitle = skill.title;
    await Skill.findByIdAndDelete(id);

    // Remove from user's skillsOffered
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { skillsOffered: skillTitle },
    });

    res.json({ msg: "Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all skills with search and filtering
exports.getAllSkills = async (req, res) => {
  try {
    const { q, category, level, excludeOwn } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (level && level !== "All") {
      filter.level = level;
    }

    if (q?.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    if (excludeOwn === "true" && req.user?.id) {
      filter.userId = { $ne: req.user.id };
    }

    const skills = await Skill.find(filter)
      .populate("userId", "name email avatar headline location ratingAverage ratingCount skillsNeeded")
      .sort({ createdAt: -1 });

    // Filter out skills where userId might be null (deleted user)
    const validSkills = skills.filter((s) => s.userId !== null);
    res.json(validSkills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get skills by user
exports.getUserSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Legacy searchUsersBySkill
exports.searchUsersBySkill = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.status(400).json({ msg: "A search query is required" });

    const skills = await Skill.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
      .populate("userId", "name email avatar headline ratingAverage ratingCount skillsNeeded")
      .sort({ title: 1 });

    const users = new Map();
    for (const skill of skills) {
      if (!skill.userId) continue;
      const id = skill.userId._id.toString();
      if (!users.has(id)) {
        users.set(id, {
          _id: skill.userId._id,
          name: skill.userId.name,
          email: skill.userId.email,
          avatar: skill.userId.avatar,
          headline: skill.userId.headline,
          ratingAverage: skill.userId.ratingAverage,
          ratingCount: skill.userId.ratingCount,
          skillsNeeded: skill.userId.skillsNeeded || [],
          skills: [],
        });
      }
      if (!users.get(id).skills.includes(skill.title)) {
        users.get(id).skills.push(skill.title);
      }
    }

    res.json([...users.values()]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Smart Barter Matching Engine
exports.getSmartMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ msg: "User not found" });

    const myOffered = (currentUser.skillsOffered || []).map((s) => s.toLowerCase().trim());
    const myNeeded = (currentUser.skillsNeeded || []).map((s) => s.toLowerCase().trim());

    // Find other users
    const otherUsers = await User.find({ _id: { $ne: req.user.id } })
      .select("name email avatar headline location ratingAverage ratingCount skillsOffered skillsNeeded bio");

    const matches = [];

    for (const user of otherUsers) {
      const theirOffered = (user.skillsOffered || []).map((s) => s.toLowerCase().trim());
      const theirNeeded = (user.skillsNeeded || []).map((s) => s.toLowerCase().trim());

      // Skills they teach that I want
      const theyCanTeachMe = user.skillsOffered.filter((s) =>
        myNeeded.some((need) => need && s.toLowerCase().includes(need) || need.includes(s.toLowerCase()))
      );

      // Skills I teach that they want
      const iCanTeachThem = currentUser.skillsOffered.filter((s) =>
        theirNeeded.some((need) => need && s.toLowerCase().includes(need) || need.includes(s.toLowerCase()))
      );

      let matchScore = 0;
      let matchType = "none";

      if (theyCanTeachMe.length > 0 && iCanTeachThem.length > 0) {
        matchScore = 100 + (theyCanTeachMe.length + iCanTeachThem.length) * 10;
        matchType = "mutual"; // Perfect barter match!
      } else if (theyCanTeachMe.length > 0) {
        matchScore = 60 + theyCanTeachMe.length * 10;
        matchType = "they_teach_you";
      } else if (iCanTeachThem.length > 0) {
        matchScore = 40 + iCanTeachThem.length * 10;
        matchType = "you_teach_them";
      }

      if (matchScore > 0) {
        matches.push({
          user,
          matchScore,
          matchType,
          theyCanTeachMe,
          iCanTeachThem,
        });
      }
    }

    // Sort by match score descending, then by user rating
    matches.sort((a, b) => b.matchScore - a.matchScore || b.user.ratingAverage - a.user.ratingAverage);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
