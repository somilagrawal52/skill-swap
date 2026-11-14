const Skill = require("../Models/skill");

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ msg: "Skill title is required" });
    }
    const skill = new Skill({ title: title.trim(), description: description?.trim(), userId: req.user.id });
    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Search skills and return matching users with the skill titles that matched.
exports.searchUsersBySkill = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.status(400).json({ msg: "A search query is required" });

    const skills = await Skill.find({ title: { $regex: query, $options: "i" } })
      .populate("userId", "name email")
      .sort({ title: 1 });

    const users = new Map();
    for (const skill of skills) {
      if (!skill.userId) continue;
      const id = skill.userId._id.toString();
      if (!users.has(id)) {
        users.set(id, { _id: skill.userId._id, name: skill.userId.name, skills: [] });
      }
      users.get(id).skills.push(skill.title);
    }

    res.json([...users.values()]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().populate("userId", "name email");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get skills by user
exports.getUserSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.params.userId });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
