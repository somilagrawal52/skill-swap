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
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "flagged", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

// High-performance compound & text indexes
SkillSchema.index({ title: "text", description: "text", tags: "text" });
SkillSchema.index({ category: 1, level: 1 });
SkillSchema.index({ isFeatured: -1, status: 1 });
SkillSchema.index({ userId: 1 });
SkillSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Skill", SkillSchema);
