const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { optionalAuth } = require("../middlewares/authMiddleware");
const {
  createSkill,
  updateSkill,
  deleteSkill,
  getAllSkills,
  getUserSkills,
  searchUsersBySkill,
  getSmartMatches,
} = require("../controllers/skillController");

router.post("/create", auth, createSkill);
router.put("/:id", auth, updateSkill);
router.delete("/:id", auth, deleteSkill);
router.get("/all", optionalAuth, getAllSkills);
router.get("/search", auth, searchUsersBySkill);
router.get("/matches", auth, getSmartMatches);
router.get("/user/:userId", getUserSkills);

module.exports = router;
