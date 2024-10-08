const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const ItemsManagement = require("../../controllers/itemsManagement/index");

// Routes

// GET: /api/items-management/
router.get("/", AsyncHandler(ItemsManagement.getItems));
// GET: /api/items-management/item-categories
router.get("/item-categories", AsyncHandler(ItemsManagement.getItemCategories));
// GET: /api/items-management/list
router.get("/list", AsyncHandler(ItemsManagement.getListItems));
// GET: /api/items-management/:id
router.get("/:id", AsyncHandler(ItemsManagement.getItem));
// GET: /api/items-management/inventory/:id
router.get("/inventory/:id", AsyncHandler(ItemsManagement.getItemsByInventory));
// GET: /api/items-management/check-availability/:id
router.post(
  "/check-availability/:id",
  AsyncHandler(ItemsManagement.checkItemAvailability)
);
// POST: /api/items-management/
router.post("/", AsyncHandler(ItemsManagement.addItem));
// PUT: /api/items-management/:id
router.put("/:id", AsyncHandler(ItemsManagement.updateItem));
// PATCH: /api/items-management/:id
router.patch("/:id", AsyncHandler(ItemsManagement.deleteItem));

module.exports = router;
