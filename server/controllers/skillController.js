const Skill = require("../models/Skill");

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { title, description } = req.body;
    const skill = new Skill({ title, description, userId: req.user.id });
    await skill.save();
    res.json(skill);
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