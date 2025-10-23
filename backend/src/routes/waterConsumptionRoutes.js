const express = require("express");
const router = express.Router();
const controller = require("../controllers/waterConsumptionController");

router.get("/by-building", controller.getWaterConsumptionByBuilding);

module.exports = router;

