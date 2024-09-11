const express = require("express");
const router = express.Router();

// IMPORT MODULE ROUTES
const ItemsManagement = require("./itemsManagement/index");
const FeedbackRoutes = require("./feedbacks/index");
const ResidentRoutes = require("./residents/index");

 
// PREFIX ASSIGNMENT (/api/<prefix>/)
router.use("/items-management", ItemsManagement);

router.use("/feedbacks", FeedbackRoutes);
router.use("/residents", ResidentRoutes);


module.exports = router;
