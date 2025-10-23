const express = require('express');
const anomalyRoutes = express.Router();
const anomalyController = require('../controllers/anomalyController');
const authMiddleware = require('../middlewares/authMiddleware');

anomalyRoutes.get('/getFilteredLogs', authMiddleware, anomalyController.getFilteredLogs);

module.exports = anomalyRoutes;
