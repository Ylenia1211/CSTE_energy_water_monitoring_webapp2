// routes/waterRoutes.js
const express = require("express");
const router = express.Router();
const WaterController = require("../controllers/waterController"); 

// GET totale consumo acqua
router.get("/total-consumption", WaterController.getTotalWaterConsumption);
router.get(
  "/total-consumption-by-building",
  WaterController.getWaterConsumptionByBuilding
);

module.exports = router;