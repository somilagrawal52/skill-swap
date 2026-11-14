const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { sendRequest, getUserRequests, respondRequest } = require("../controllers/requestController");

router.post("/send", auth, sendRequest);
router.get("/my", auth, getUserRequests);
router.put("/respond/:requestId", auth, respondRequest);

module.exports = router;