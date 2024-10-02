const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const EstateController = require("../../controllers/estates/index");

// MAIN ROUTES

// GET: /api/estates/
router.get("/", AsyncHandler(EstateController.getEstates));
// GET: /api/estates/:id
router.get("/:id", AsyncHandler(EstateController.getEstate));
// POST: /api/estates/
router.post("/", AsyncHandler(EstateController.addEstate));
// PUT: /api/estates/
router.put("/", AsyncHandler(EstateController.updateEstate));
// PATCH: /api/estates/:id
router.patch("/:id", AsyncHandler(EstateController.deleteEstate));

module.exports = router;
