/**
 * @fileoverview
 * Questo modulo gestisce le operazioni relative alle query disponibili per il sistema.
 * In particolare, offre una funzione per ottenere l'elenco delle query che sono accessibili tramite il servizio `queryService`.
 *
 * @module queryController
 */

const queryService = require("../services/queryService");

/**
 * Restituisce l'elenco delle query disponibili.
 * Se si verifica un errore durante l'esecuzione della richiesta, viene restituito un errore appropriato.
 *
 * @function getQueries
 * @param {Object} req - La richiesta HTTP. Non sono richiesti parametri specifici.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Object} - Un oggetto JSON che contiene l'elenco delle query disponibili.
 * @throws {Error} - Se si verifica un errore durante la richiesta, restituisce un errore con codice 500.
 */
const getQueries = (req, res) => {
  try {
    // Recupera le query disponibili dal servizio
    const queries = queryService.getAvailableQueries();

    // Restituisce una risposta positiva con i dati delle query disponibili
    res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    console.error("Errore durante la richiesta delle query:", error);

    // Restituisce un errore con codice 500 in caso di problema
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
    });
  }
};

module.exports = {
  getQueries,
};
