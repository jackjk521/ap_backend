const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const FeedbackController = require("../../controllers/feedbacks/index");

// MAIN ROUTES

// GET: /api/feedbacks/
router.get("/", AsyncHandler(FeedbackController.getFeedbacks));
// GET: /api/feedbacks/:id
router.get("/:id", AsyncHandler(FeedbackController.getFeedback));
// POST: /api/feedbacks/
router.post("/", AsyncHandler(FeedbackController.addFeedback));
// PUT: /api/feedbacks/
router.put("/", AsyncHandler(FeedbackController.updateFeedback));
// PATCH: /api/feedbacks/:id
router.patch("/:id", AsyncHandler(FeedbackController.deleteFeedback));

module.exports = router;
