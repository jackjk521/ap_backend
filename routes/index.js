const express = require("express");
const router = express.Router();

// IMPORT MODULE ROUTES
const ItemsManagement = require("./itemsManagement/index");
const FeedbackRoutes = require("./feedbacks/index");
 
// PREFIX ASSIGNMENT (/api/<prefix>/)
router.use("/items-management", ItemsManagement);
router.use("/feedbacks", FeedbackRoutes);


module.exports = router;
