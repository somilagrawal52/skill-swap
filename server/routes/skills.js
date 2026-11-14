const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { createSkill, getAllSkills, getUserSkills, searchUsersBySkill } = require("../controllers/skillController");

router.post("/create", auth, createSkill);
router.get("/all", getAllSkills);
router.get("/search", auth, searchUsersBySkill);
router.get("/user/:userId", getUserSkills);

module.exports = router;
