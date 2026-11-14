const SwapRequest = require("../models/SwapRequest");
const Skill = require("../models/Skill");
const User = require("../models/User");

// Send a swap request
exports.sendRequest = async (req, res) => {
  try {
    const { toUser, offeredSkill, requestedSkill } = req.body;
    const swap = new SwapRequest({
      fromUser: req.user.id,
      toUser,
      offeredSkill,
      requestedSkill
    });
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get swap requests for logged-in user
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ toUser: req.user.id })
      .populate("fromUser", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Respond to swap request (accept/decline)
exports.respondRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // accepted / declined

    const request = await SwapRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    request.status = status;
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};