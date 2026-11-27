const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const messageController = require("../controllers/messageController");

// All messaging endpoints require authentication
router.use(auth);

// Get conversations & unread count
router.get("/conversations", messageController.getConversations);
router.get("/unread/count", messageController.getUnreadCount);

// Send message
router.post("/send", messageController.sendMessage);

// Message history & thread by user or swap
router.get("/swap/:swapId", messageController.getMessagesBySwap);
router.get("/:userId", messageController.getMessagesWithUser);
router.put("/read/:userId", messageController.markAsRead);

module.exports = router;
