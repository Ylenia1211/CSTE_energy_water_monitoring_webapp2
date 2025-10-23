const express = require("express");
const { totalCostByBuildingController } = require("../controllers/waterCostController");

const router = express.Router();

// Endpoint GET: /api/watercost/total-cost-by-building?start=2025-01-01&end=2025-03-31
router.get("/total-cost-by-building", totalCostByBuildingController);

module.exports = router;