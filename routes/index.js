const express = require("express");
const router = express.Router();

// importing all routes
const ItemsManagement = require("./itemsManagement/index");


// assign prefix - to routes
router.use("/items-management", ItemsManagement);


module.exports = router;
