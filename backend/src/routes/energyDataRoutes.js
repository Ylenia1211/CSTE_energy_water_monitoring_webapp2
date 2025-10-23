const express = require("express");
const energyDataRoutes = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const energyDataController = require("../controllers/energyDataController");

// API per ottenere i dati energetici in un periodo con la possibilità di utilizzare filtri e proiezioni (fields)
//http://localhost:5542/api/energy-data?startDate=2024-11-01T00:00:00Z&endDate=2024-11-19T23:59:59Z&fields=PhV.phsA,TotWh.import,building&building=ED16
energyDataRoutes.get(
  "/energy-data",
  authMiddleware,
  energyDataController.getValuesByFilter
);

// Dati Live
// energyDataRoutes.get('/live/building', energyDataController.getLiveValuesByBuilding);
energyDataRoutes.get(
  "/live",
  authMiddleware,
  energyDataController.getLiveValues
);

energyDataRoutes.get(
  "/totalConsumption",
  authMiddleware,
  energyDataController.getTotalConsumption
);

energyDataRoutes.get(
  "/totalConsumptionByBuilding",
  authMiddleware,
  energyDataController.getTotalConsumptionByBuilding
);

energyDataRoutes.get(
  "/barChartDataBuilding",
  authMiddleware,
  energyDataController.getBarChartByBuilding
);

energyDataRoutes.get(
  "/weekly-consumption",
  authMiddleware,
  energyDataController.getWeeklyConsumptionByDay
);

// Endpoint per ottenere gli edifici e impianti
energyDataRoutes.get(
  "/info_meters",
  authMiddleware,
  energyDataController.getInfoMeters
);

energyDataRoutes.get(
  "/nestedFieldData",
  authMiddleware,
  energyDataController.getNestedFields
);

energyDataRoutes.get(
  "/hourly-average-consumption",
  authMiddleware,
  energyDataController.getHourlyAverageConsumption
);

energyDataRoutes.get(
  "/hourly-average-total-consumption",
  authMiddleware,
  energyDataController.getHourlyAverageConsumptionTotal
);

module.exports = energyDataRoutes;
