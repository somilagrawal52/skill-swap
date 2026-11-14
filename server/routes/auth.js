const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const {
  register,
  login,
  getMe,
  updateProfile,
  getUserProfile,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);
router.get("/profile/:id", getUserProfile);

module.exports = router;
