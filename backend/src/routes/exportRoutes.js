const express = require('express');
const exportDataRoutes = express.Router();
const exportExcelController = require('../controllers/exportExcelController');
const exportPDFController = require('../controllers/exportPDFController');
const authMiddleware = require('../middlewares/authMiddleware');


// Esporta dati sottoforma di tabella 
exportDataRoutes.post('/excel', exportExcelController.exportData);

// Esporta dati sottoforma di tabella 
exportDataRoutes.post('/export-query-data', exportExcelController.exportQueryData);

// Rotta per generare il PDF
exportDataRoutes.post('/export-pdf', exportPDFController.generatePDF);

module.exports = exportDataRoutes
