const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    location: { type: String, default: "" },
    timezone: { type: String, default: "" },
    contactInfo: {
      email: { type: String, default: "" },
      discord: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      calendly: { type: String, default: "" },
    },
    skillsOffered: [{ type: String, trim: true }],
    skillsNeeded: [{ type: String, trim: true }],
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    completedSwapsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Never expose password hash in JSON output
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
