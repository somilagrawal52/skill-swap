const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const {
  sendRequest,
  getUserRequests,
  getSentRequests,
  respondRequest,
  cancelRequest,
  completeSwap,
  updateSessionNotes,
} = require("../controllers/requestController");

router.post("/send", auth, sendRequest);
router.get("/my", auth, getUserRequests);
router.get("/incoming", auth, getUserRequests);
router.get("/sent", auth, getSentRequests);
router.put("/respond/:requestId", auth, respondRequest);
router.put("/cancel/:requestId", auth, cancelRequest);
router.put("/complete/:requestId", auth, completeSwap);
router.put("/notes/:requestId", auth, updateSessionNotes);

module.exports = router;
