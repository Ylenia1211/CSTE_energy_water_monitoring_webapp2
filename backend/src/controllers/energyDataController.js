/**
 * @fileoverview
 * Questo file gestisce le richieste HTTP per ottenere dati energetici filtrati in vari formati e per diverse esigenze, come i consumi totali, valori live, e grafici.
 * Le richieste vengono inviate al servizio `energyDataService` che si occupa di recuperare i dati dal database o da altre fonti.
 * Ogni endpoint si occupa di specifici filtri e calcoli, come consumi totali, medie orarie, grafici settimanali, e altro.
 *
 * Ogni funzione di questo file verifica la validità dei parametri della query string, come date e altri filtri, e restituisce i risultati in formato JSON.
 * Se si verificano errori durante l'esecuzione, viene restituito un messaggio di errore con codice HTTP appropriato.
 *
 * @module energyDataController
 */

const energyDataService = require("../services/energyDataService");

/**
 * Funzione per ottenere i dati energetici filtrati in base ai parametri passati nella query string.
 * La risposta è un JSON contenente i dati filtrati.
 *
 * @async
 * @function getValuesByFilter
 * @param {Object} req - La richiesta HTTP, contenente i parametri di filtro nella query string (startDate, endDate, fields, altri filtri).
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati filtrati al client.
 * @returns {Object} - Risultati dei dati energetici filtrati.
 * @throws {Error} - Se le date non sono presenti o non valide.
 */
const getValuesByFilter = async (req, res) => {
  try {
    const filters = req.query;
    const { startDate, endDate, fields, ...otherFilters } = filters;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Le date di inizio e fine sono obbligatorie" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message:
          "Le date devono essere nel formato ISO valido (es. 2023-01-01T00:00:00Z)",
      });
    }

    const energyData = await energyDataService.getValuesByFilter(
      start,
      end,
      fields,
      otherFilters
    );
    return res.status(200).json(energyData);
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per ottenere i dati energetici live per un edificio specifico.
 * La risposta è un JSON contenente i dati live per l'edificio richiesto.
 *
 * @async
 * @function getLiveValuesByBuilding
 * @param {Object} req - La richiesta HTTP, contenente l'id dell'edificio nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati live al client.
 * @returns {Object} - Risultato dei dati live per l'edificio.
 * @throws {Error} - Se si verifica un errore nel recupero dei dati live.
 */
const getLiveValuesByBuilding = async (req, res) => {
  const { building } = req.query;
  try {
    const energyData = await energyDataService.getLiveValuesByBuilding(
      building
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per ottenere i dati energetici live per più edifici o altre categorie generali.
 * La risposta è un JSON contenente i dati live in base ai filtri passati.
 *
 * @async
 * @function getLiveValues
 * @param {Object} req - La richiesta HTTP, contenente i filtri nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati live al client.
 * @returns {Object} - Risultato dei dati live.
 * @throws {Error} - Se si verifica un errore nel recupero dei dati live.
 */
const getLiveValues = async (req, res) => {
  const filters = req.query;
  try {
    const energyData = await energyDataService.getLiveValues(filters);
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per calcolare i consumi totali di energia in un intervallo di tempo definito da `startDate` e `endDate`.
 * La risposta è un JSON contenente i dati del consumo totale.
 *
 * @async
 * @function getTotalConsumption
 * @param {Object} req - La richiesta HTTP, contenente `startDate` e `endDate` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati del consumo totale al client.
 * @returns {Object} - Risultato dei consumi totali.
 * @throws {Error} - Se si verifica un errore nel recupero dei consumi totali.
 */
const getTotalConsumption = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const energyData = await energyDataService.getTotalConsumption(
      startDate,
      endDate
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per calcolare i consumi totali di energia per un edificio specifico.
 * La risposta è un JSON contenente i dati del consumo totale per l'edificio richiesto.
 *
 * @async
 * @function getTotalConsumptionByBuilding
 * @param {Object} req - La richiesta HTTP, contenente `startDate` e `endDate` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati del consumo totale per edificio al client.
 * @returns {Object} - Risultato dei consumi totali per edificio.
 * @throws {Error} - Se si verifica un errore nel recupero dei consumi totali per edificio.
 */
const getTotalConsumptionByBuilding = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const energyData = await energyDataService.getTotalConsumptionByBuilding(
      startDate,
      endDate
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per generare un grafico a barre per l'analisi del consumo energetico per edificio.
 * La risposta è un JSON contenente i dati necessari per costruire il grafico.
 *
 * @async
 * @function getBarChartByBuilding
 * @param {Object} req - La richiesta HTTP, contenente i parametri per il grafico nella query string (startDate, endDate, buildings, impianti).
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati del grafico al client.
 * @returns {Object} - Risultato dei dati per il grafico a barre.
 * @throws {Error} - Se si verifica un errore nel recupero dei dati per il grafico.
 */
const getBarChartByBuilding = async (req, res) => {
  const { startDate, endDate, buildings, impianti } = req.query;
  try {
    const energyData = await energyDataService.getBarChartByBuilding(
      startDate,
      endDate,
      buildings,
      impianti
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per recuperare i consumi settimanali, suddivisi per giorno, in un intervallo di tempo definito da `startDate` e `endDate`.
 * La risposta è un JSON contenente i consumi settimanali per giorno.
 *
 * @async
 * @function getWeeklyConsumptionByDay
 * @param {Object} req - La richiesta HTTP, contenente `startDate`, `endDate`, `buildings`, e `impianti` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati dei consumi settimanali per giorno al client.
 * @returns {Object} - Risultato dei consumi settimanali per giorno.
 * @throws {Error} - Se si verifica un errore nel recupero dei consumi settimanali.
 */
const getWeeklyConsumptionByDay = async (req, res) => {
  const { startDate, endDate, buildings, impianti } = req.query;
  try {
    const chartData = await energyDataService.getWeeklyConsumptionByDay(
      startDate,
      endDate,
      buildings,
      impianti
    );
    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per recuperare le informazioni sui contatori energetici.
 * La risposta è un JSON contenente i dettagli dei contatori.
 *
 * @async
 * @function getInfoMeters
 * @param {Object} req - La richiesta HTTP.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare le informazioni dei contatori al client.
 * @returns {Object} - Risultato delle informazioni sui contatori.
 * @throws {Error} - Se si verifica un errore nel recupero delle informazioni.
 */
const getInfoMeters = async (req, res) => {
  try {
    const energyData = await energyDataService.getInfoMeters();
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per recuperare i dati annidati (nested) per un campo specifico.
 * La risposta è un JSON contenente i dati annidati.
 *
 * @async
 * @function getNestedFields
 * @param {Object} req - La richiesta HTTP, contenente `fieldName`, `startDate`, `endDate`, `buildings`, e `impianti` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i dati annidati al client.
 * @returns {Object} - Risultato dei dati annidati per il campo richiesto.
 * @throws {Error} - Se si verifica un errore nel recupero dei dati annidati.
 */
const getNestedFields = async (req, res) => {
  const { fieldName, startDate, endDate, buildings, impianti } = req.query;
  try {
    const energyData = await energyDataService.getNestedFields(
      fieldName,
      startDate,
      endDate,
      buildings,
      impianti
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per calcolare i consumi orari medi in un intervallo di tempo definito da `startDate` e `endDate`.
 * La risposta è un JSON contenente i consumi orari medi.
 *
 * @async
 * @function getHourlyAverageConsumption
 * @param {Object} req - La richiesta HTTP, contenente `startDate`, `endDate`, `buildings`, e `impianti` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i consumi orari medi al client.
 * @returns {Object} - Risultato dei consumi orari medi.
 * @throws {Error} - Se si verifica un errore nel recupero dei consumi orari medi.
 */
const getHourlyAverageConsumption = async (req, res) => {
  const { startDate, endDate, buildings, impianti } = req.query;
  try {
    const energyData = await energyDataService.getHourlyAverageConsumption(
      startDate,
      endDate,
      buildings,
      impianti
    );
    return res.status(200).json(energyData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei dati", error });
  }
};

/**
 * Funzione per calcolare i consumi orari medi totali in un intervallo di tempo definito da `startDate` e `endDate`.
 * La risposta è un JSON contenente i consumi orari medi e il valore medio costante.
 *
 * @async
 * @function getHourlyAverageConsumptionTotal
 * @param {Object} req - La richiesta HTTP, contenente `startDate`, `endDate` e `building` nella query string.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i consumi orari medi al client.
 * @returns {Object} - Risultato dei consumi orari medi totali.
 * @throws {Error} - Se si verifica un errore nel recupero dei consumi orari medi totali.
 */
const getHourlyAverageConsumptionTotal = async (req, res) => {
  const { startDate, endDate, building } = req.query;

  try {
    // Chiama la funzione di servizio per ottenere i dati
    const rawData = await energyDataService.getHourlyAverageConsumptionTotal(
      startDate,
      endDate,
      building
    );

    // Rispondi con i dati calcolati
    return res.status(200).json(rawData);
  } catch (error) {
    // Gestisci eventuali errori
    console.error("Errore nel calcolo dei consumi orari medi:", error.message);
    return res.status(500).json({
      message: "Errore nel recupero dei dati dei consumi orari medi",
      error: error.message,
    });
  }
};

module.exports = {
  getValuesByFilter,
  getLiveValuesByBuilding,
  getLiveValues,
  getTotalConsumption,
  getTotalConsumptionByBuilding,
  getBarChartByBuilding,
  getInfoMeters,
  getNestedFields,
  getWeeklyConsumptionByDay,
  getHourlyAverageConsumption,
  getHourlyAverageConsumptionTotal,
};
