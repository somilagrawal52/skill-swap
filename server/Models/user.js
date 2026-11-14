const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsOffered: [String],
  skillsNeeded: [String],
  bio: String
});

module.exports = mongoose.model("User", UserSchema);
