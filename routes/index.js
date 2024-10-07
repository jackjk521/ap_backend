const express = require("express");
const router = express.Router();

// IMPORT MODULE ROUTES
const ItemsManagement = require("./itemsManagement/index");
const FeedbackRoutes = require("./feedbacks/index");
const ResidentRoutes = require("./residents/index");
const EstateRoutes = require("./estates/index");
const UserRoutes = require("./estates/index");
const ConcernRoutes = require("./estates/index");
const TransactionsRoutes = require("./estates/index");


// PREFIX ASSIGNMENT (/api/<prefix>/)
router.use("/items-management", ItemsManagement);
// MAIN ROUTE HEADERS
router.use("/feedbacks", FeedbackRoutes);
router.use("/residents", ResidentRoutes);
router.use("/estates", EstateRoutes);
router.use("/transactions", TransactionsRoutes);



module.exports = router;
