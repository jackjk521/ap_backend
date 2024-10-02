const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const UserController = require("../../controllers/users/index");

// MAIN ROUTES
// GET: /api/users/
router.get("/", AsyncHandler(UserController.getUsers));
// GET: /api/users/:id
router.get("/:id", AsyncHandler(UserController.getUser));
// POST: /api/users/
router.post("/", AsyncHandler(UserController.addUser));
// PUT: /api/users/
router.put("/", AsyncHandler(UserController.updateUser));
// PATCH: /api/users/:id
router.patch("/:id", AsyncHandler(UserController.deleteUser));

module.exports = router;
