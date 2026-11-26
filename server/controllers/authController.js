const User = require("../Models/user");
const Skill = require("../Models/skill");
const Review = require("../Models/review");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Generate JWT Helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ msg: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({
        msg: user.banReason || "Your account has been suspended by an administrator.",
      });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get current user profile (with refresh)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      headline,
      bio,
      avatar,
      location,
      timezone,
      contactInfo,
      skillsNeeded,
      skillsOffered,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name.trim();
    if (headline !== undefined) user.headline = headline.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar) user.avatar = avatar;
    if (location !== undefined) user.location = location.trim();
    if (timezone !== undefined) user.timezone = timezone.trim();
    if (contactInfo) {
      user.contactInfo = { ...user.contactInfo, ...contactInfo };
    }
    if (Array.isArray(skillsNeeded)) {
      user.skillsNeeded = skillsNeeded.map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(skillsOffered)) {
      user.skillsOffered = skillsOffered.map((s) => s.trim()).filter(Boolean);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get public profile of another user
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const skills = await Skill.find({ userId: user._id });
    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });

    res.json({
      user,
      skills,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
