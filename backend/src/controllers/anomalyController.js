/**
 * @fileoverview
 * Questo file gestisce le richieste HTTP per ottenere i log delle anomalie filtrati.
 * I parametri di filtro, come le date, il tipo, il messaggio, gli edifici e i sensori, vengono estratti dalla query string della richiesta.
 * Il servizio `anomalyService.getFilteredLogs` viene invocato per recuperare i dati necessari e la risposta viene restituita come JSON.
 * Se si verifica un errore durante il processo, una risposta con errore 500 viene restituita.
 * @module anomalyController
 */

const anomalyService = require("../services/anomalyService");

/**
 * Gestisce la richiesta HTTP per recuperare le anomalie dai log filtrati.
 *
 * Estrae i parametri di ricerca (date, tipo, messaggio, edifici, sensori) dalla query string della richiesta
 * e chiama il servizio `anomalyService.getFilteredLogs` per ottenere i dati.
 *
 * @async
 * @function getFilteredLogs
 * @param {Object} req - L'oggetto della richiesta HTTP.
 * @param {Object} res - L'oggetto della risposta HTTP.
 * @returns {Promise<void>} Restituisce una risposta JSON contenente i log delle anomalie filtrati.
 *
 * @throws {Error} Se si verifica un errore durante il recupero dei log, restituisce un errore 500 con un messaggio di errore.
 *
 * @example
 * // Richiesta GET per ottenere i log filtrati
 * GET /api/anomalies?startDate=2023-01-01&endDate=2023-12-31&type=error&limit=10&page=1
 */
async function getFilteredLogs(req, res) {
  try {
    // Imposta i valori di default per page e limit se non sono forniti
    const pageNumber = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 10;

    // Variabile per decidere se si desidera disabilitare la paginazione
    const noPagination = req?.query?.noPagination;

    // Crea l'oggetto di filtri con i parametri della query string
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type,
      message: req.query.message,
      buildings: req.query.building,
      sensor: req.query.impianti,
    };

    // Ottieni le anomalie filtrate dal servizio
    const anomalies = await anomalyService.getFilteredLogs(
      filters,
      pageNumber,
      pageSize,
      noPagination
    );

    // Risponde con i dati delle anomalie
    res.json(anomalies);
  } catch (error) {
    // Gestione degli errori
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getFilteredLogs };
