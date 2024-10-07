const express = require("express");
const AsyncHandler = require("express-async-handler");
const router = express.Router();

const TransactionController = require("../../controllers/transactions/index");

// DB 
// PUT: /api/transactions/db
router.put("/", AsyncHandler(TransactionController.updateTransactionDB));

// MAIN ROUTES

// GET: /api/transactions/
router.get("/", AsyncHandler(TransactionController.getTransactions));
// GET: /api/transactions/:id
router.get("/:id", AsyncHandler(TransactionController.getEstate));
// POST: /api/transactions/
router.post("/", AsyncHandler(TransactionController.addEstate));
// PUT: /api/transactions/
router.put("/", AsyncHandler(TransactionController.updateEstate));
// PATCH: /api/transactions/:id
router.patch("/:id", AsyncHandler(TransactionController.deleteEstate));


module.exports = router;
