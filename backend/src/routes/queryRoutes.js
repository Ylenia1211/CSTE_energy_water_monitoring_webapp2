// routes/queryRoutes.js
const express = require('express');
const queryRoutes = express.Router();
const queryController = require('../controllers/queryController');

// Definizione dell'endpoint per ottenere le query disponibili
queryRoutes.get('/all', queryController.getQueries);

module.exports = queryRoutes;
