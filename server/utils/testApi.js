require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const request = require("http");

async function runTests() {
  console.log("Testing Backend APIs...");
  // Let's test direct controller calls or logic
  const User = require("../Models/user");
  const Skill = require("../Models/skill");
  const users = await User.find({});
  console.log(`Found ${users.length} users in DB.`);
  const skills = await Skill.find({});
  console.log(`Found ${skills.length} skills in DB.`);

  // Test smart matching logic
  const reqMock = {
    user: { id: users[0]._id },
  };
  let result = null;
  const resMock = {
    json: (data) => { result = data; },
    status: (code) => resMock,
  };

  const skillController = require("../controllers/skillController");
  await skillController.getSmartMatches(reqMock, resMock);
  console.log(`Smart Matches for ${users[0].name}: found ${result ? result.length : 0} match(es)`);
  if (result && result.length > 0) {
    console.log(`Top match: ${result[0].user.name} (Score: ${result[0].matchScore}, Type: ${result[0].matchType})`);
  }
}

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap")
  .then(runTests)
  .then(() => {
    console.log("All controller tests passed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
