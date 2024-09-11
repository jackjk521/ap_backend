const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const ResidentController = require("../../controllers/residents/index");

// MAIN ROUTES

// GET: /api/residents/
router.get("/", AsyncHandler(ResidentController.getResidents));

// // GET: /api/items-management/item-categories
// router.get("/item-categories", AsyncHandler(ItemsManagement.getItemCategories));
// // GET: /api/items-management/list
// router.get("/list", AsyncHandler(ItemsManagement.getListItems));
// // GET: /api/items-management/:id
// router.get("/:id", AsyncHandler(ItemsManagement.getItem));
// // GET: /api/items-management/inventory/:id
// router.get("/inventory/:id", AsyncHandler(ItemsManagement.getItemsByInventory));
// // GET: /api/items-management/check-availability/:id
// router.post(
//   "/check-availability/:id",
//   AsyncHandler(ItemsManagement.checkItemAvailability)
// );

// POST: /api/feedbacks/
// router.post("/", AsyncHandler(FeedbackController.addFeedback));
// // PUT: /api/items-management/:id
// router.put("/:id", AsyncHandler(ItemsManagement.updateItem));
// // PATCH: /api/items-management/:id
// router.patch("/:id", AsyncHandler(ItemsManagement.deleteItem));

module.exports = router;
