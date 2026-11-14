const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { createReview, getUserReviews } = require("../controllers/reviewController");

router.post("/", auth, createReview);
router.get("/user/:userId", getUserReviews);

module.exports = router;
