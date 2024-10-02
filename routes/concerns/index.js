const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const ConcernController = require("../../controllers/concerns/index");

// MAIN ROUTES

// GET: /api/concerns/
router.get("/", AsyncHandler(ConcernController.getEstates));
// GET: /api/concerns/:id
router.get("/:id", AsyncHandler(ConcernController.getEstate));
// POST: /api/concerns/
router.post("/", AsyncHandler(ConcernController.addEstate));
// PUT: /api/concerns/
router.put("/", AsyncHandler(ConcernController.updateEstate));
// PATCH: /api/concerns/:id
router.patch("/:id", AsyncHandler(ConcernController.deleteEstate));

module.exports = router;
