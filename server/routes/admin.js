const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/adminController");

// Protect all admin routes with auth and admin role check
router.use(auth, admin);

// Platform Overview & Metrics
router.get("/metrics", adminController.getPlatformMetrics);

// User Management
router.get("/users", adminController.getUsers);
router.patch("/users/:id/ban", adminController.toggleUserBan);
router.patch("/users/:id/credits", adminController.adjustUserCredits);
router.patch("/users/:id/role", adminController.toggleUserRole);

// Skill Moderation
router.get("/skills", adminController.getSkills);
router.patch("/skills/:id/feature", adminController.toggleSkillFeatured);
router.patch("/skills/:id/status", adminController.updateSkillStatus);
router.delete("/skills/:id", adminController.deleteSkill);

// Swap Oversight & Dispute Resolution
router.get("/swaps", adminController.getSwaps);
router.post("/swaps/:id/resolve", adminController.resolveSwap);

module.exports = router;
