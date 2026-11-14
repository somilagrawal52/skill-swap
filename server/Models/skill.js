const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: [
        "Development & IT",
        "Design & Creative",
        "Languages",
        "Marketing & Business",
        "Music & Audio",
        "Academics",
        "Fitness & Health",
        "Lifestyle & Other",
      ],
      default: "Development & IT",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    tags: [{ type: String, trim: true }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", SkillSchema);
