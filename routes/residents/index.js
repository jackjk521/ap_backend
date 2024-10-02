const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const ResidentController = require("../../controllers/residents/index");

// MAIN ROUTES

// GET: /api/residents/
router.get("/", AsyncHandler(ResidentController.getResidents));
// GET: /api/residents/:id
router.get("/:id", AsyncHandler(ResidentController.getResident));
// POST: /api/residents/
router.post("/", AsyncHandler(ResidentController.addResident));
// PUT: /api/residents/
router.put("/", AsyncHandler(ResidentController.updateResident));
// PATCH: /api/residents/:id
router.patch("/:id", AsyncHandler(ResidentController.deleteResident));

module.exports = router;
