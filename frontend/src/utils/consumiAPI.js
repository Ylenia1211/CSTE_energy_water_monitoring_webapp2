/**
 * @namespace utils
 * @fileoverview
 * Modulo per interagire con l'API relativa ai consumi energetici.
 *
 * Questo modulo contiene diverse funzioni per recuperare i dati di consumo energetico, inclusi:
 * - Consumi totali per un intervallo di tempo.
 * - Consumi separati per edificio.
 * - Dati per la generazione di grafici a barre.
 * - Dati sui contatori e altre informazioni specifiche.
 *
 * Le funzioni di questo modulo si basano su Axios per inviare richieste HTTP al server.
 * Ogni funzione gestisce gli errori e restituisce i dati ricevuti dal backend.
 *
 * @module consumiAPI
 *  @requires axiosInstance
 */

import axiosInstance from "./api";

const BASE_API = "/api";

import api from "./api";

/**
 * Recupera il consumo di acqua per edificio
 * @returns {Promise<Array>} Lista di oggetti con _id (edificio) e totaleConsumo
 */
/*
export async function fetchWaterConsumptionByBuilding() {
  try {
    const response = await api.get("api/consumption/water/by-building");
    return response.data;
  } catch (error) {
    console.error("Errore nel recupero dei dati di consumo acqua per edificio:", error);
    throw error;
  }
}* 


/**
 * Recupera i consumi totali in un intervallo di tempo specificato.
 *
 * Invia una richiesta GET per ottenere i consumi totali tra `startDate` e `endDate`.
 *
 * @function
 * @name fetchTotalConsumption
 * @param {string} startDate - La data di inizio dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {string} endDate - La data di fine dell'intervallo, nel formato "YYYY-MM-DD".
 * @returns {Promise<Object>} Una promessa che risolve i consumi totali per l'intervallo specificato.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchTotalConsumption = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/totalConsumption`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    throw new Error("Errore nella richiesta dei consumi: " + error.message);
  }
};

/**
 * Recupera i consumi separati per edificio in un intervallo di tempo specificato.
 *
 * Invia una richiesta GET per ottenere i consumi separati per ogni edificio tra `startDate` e `endDate`.
 *
 * @function
 * @name fetchTotalConsumptionByBuilding
 * @param {string} startDate - La data di inizio dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {string} endDate - La data di fine dell'intervallo, nel formato "YYYY-MM-DD".
 * @returns {Promise<Object>} Una promessa che risolve i consumi per ogni edificio nell'intervallo specificato.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchTotalConsumptionByBuilding = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_API}/totalConsumptionByBuilding`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      "Errore nella richiesta dei consumi per edificio: " + error.message
    );
  }
};

/**
 * Recupera i dati per il grafico a barre sugli edifici in un intervallo di tempo specificato.
 *
 * Invia una richiesta GET per ottenere i dati per il grafico a barre separati per edifici e impianti.
 *
 * @function
 * @name fetchBarChartDataByBuilding
 * @param {string} startDate - La data di inizio dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {string} endDate - La data di fine dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {Array<string>} [buildings=[]] - Un array di edifici per filtrare i dati. Se vuoto, verranno presi tutti gli edifici.
 * @param {Array<string>} [impianti=[]] - Un array di impianti per filtrare i dati. Se vuoto, verranno presi tutti gli impianti.
 * @returns {Promise<Object>} Una promessa che risolve i dati del grafico a barre per gli edifici specificati.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchBarChartDataByBuilding = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_API}/barChartDataBuilding`,
      {
        params: {
          startDate,
          endDate,
          buildings: JSON.stringify(buildings),
          impianti: JSON.stringify(impianti),
        },
      }
    );
    return response.data; // Assumiamo che i dati vengano restituiti come chartData
  } catch (error) {
    throw new Error(
      "Errore nel recupero dei dati per il grafico: " + error.message
    );
  }
};

/**
 * Recupera i dati settimanali per il grafico a barre sugli edifici in un intervallo di tempo specificato.
 *
 * Invia una richiesta GET per ottenere i dati settimanali per il grafico a barre separati per edifici e impianti.
 *
 * @function
 * @name fetchWeeklyBarChartDataByBuilding
 * @param {string} startDate - La data di inizio dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {string} endDate - La data di fine dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {Array<string>} [buildings=[]] - Un array di edifici per filtrare i dati. Se vuoto, verranno presi tutti gli edifici.
 * @param {Array<string>} [impianti=[]] - Un array di impianti per filtrare i dati. Se vuoto, verranno presi tutti gli impianti.
 * @returns {Promise<Object>} Una promessa che risolve i dati settimanali per il grafico a barre per gli edifici specificati.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchWeeklyBarChartDataByBuilding = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/weekly-consumption`, {
      params: {
        startDate,
        endDate,
        buildings: JSON.stringify(buildings),
        impianti: JSON.stringify(impianti),
      },
    });
    return response.data; // Assumiamo che i dati vengano restituiti come chartData
  } catch (error) {
    console.error(
      "Errore nel recupero dei dati per il grafico: ",
      error.message
    );
    throw new Error(
      "Errore durante il recupero dei dati per il grafico: " + error.message
    );
  }
};

/**
 * Recupera i dati sui contatori.
 *
 * Invia una richiesta GET per ottenere informazioni sui contatori disponibili.
 *
 * @function
 * @name fetchMetersData
 * @returns {Promise<Object>} Una promessa che risolve i dati sui contatori.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchMetersData = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/info_meters`);
    return response.data;
  } catch (error) {
    throw new Error("Errore nella richiesta dei consumi: " + error.message);
  }
};

/**
 * Recupera dati specifici in base a campi innestati.
 *
 * Invia una richiesta GET per ottenere dati specifici in base a un campo innestato, come impianti o edifici.
 *
 * @function
 * @name fetchNestedFieldData
 * @param {string} fieldName - Il nome del campo innestato per cui ottenere i dati.
 * @param {string} startDate - La data di inizio dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {string} endDate - La data di fine dell'intervallo, nel formato "YYYY-MM-DD".
 * @param {Array<string>} [buildings=[]] - Un array di edifici per filtrare i dati. Se vuoto, verranno presi tutti gli edifici.
 * @param {Array<string>} [impianti=[]] - Un array di impianti per filtrare i dati. Se vuoto, verranno presi tutti gli impianti.
 * @returns {Promise<Object>} Una promessa che risolve i dati del campo specificato.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con il messaggio di errore.
 */
export const fetchNestedFieldData = async (
  fieldName,
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/nestedFieldData`, {
      params: {
        fieldName,
        startDate,
        endDate,
        buildings: JSON.stringify(buildings),
        impianti: JSON.stringify(impianti),
      },
    });
    return response.data; // I dati sono restituiti dal backend
  } catch (error) {
    throw new Error(
      `Errore nel recupero dei dati per il campo ${fieldName}: ${error.message}`
    );
  }
};

/**
 * Recupera i dati sul consumo medio orario tra una data di inizio e una di fine,
 * filtrando per edifici e impianti specifici, se forniti.
 *
 * Questa funzione invia una richiesta GET al server per ottenere i dati aggregati
 * per il consumo medio orario di energia elettrica, considerando gli edifici e gli impianti
 * forniti nei parametri.
 *
 * @function
 * @name fetchHourlyAverageConsumption
 * @param {string} startDate - La data di inizio del periodo (formato ISO 8601).
 * @param {string} endDate - La data di fine del periodo (formato ISO 8601).
 * @param {Array<Object>} [buildings=[]] - Un array di edifici per i quali recuperare i dati di consumo. Default è un array vuoto.
 * @param {Array<Object>} [impianti=[]] - Un array di impianti per i quali recuperare i dati di consumo. Default è un array vuoto.
 * @returns {Promise<Object>} Una promessa che risolve i dati di risposta dal server, contenente le informazioni sul consumo medio orario.
 * @throws {Error} Se si verifica un errore durante il recupero dei dati, viene sollevato un errore con un messaggio descrittivo.
 *
 */
export const fetchHourlyAverageConsumption = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    const response = await axiosInstance.get(
      `${BASE_API}/hourly-average-consumption`,
      {
        params: {
          startDate,
          endDate,
          buildings: JSON.stringify(buildings),
          impianti: JSON.stringify(impianti),
        },
      }
    );
    return response.data; // Assumiamo che i dati vengano restituiti come chartData
  } catch (error) {
    console.error(
      "Errore nel recupero dei dati per il grafico: ",
      error.message
    );
    throw new Error(
      "Errore durante il recupero dei dati per il grafico: " + error.message
    );
  }
};

/**
 * Recupera i dati sul consumo medio orario totale tra una data di inizio e una di fine.
 * La risposta è un JSON contenente i consumi orari medi e il valore medio costante.
 *
 * Questa funzione invia una richiesta GET al server per ottenere i dati aggregati
 * per il consumo medio orario di energia elettrica, considerando il periodo specificato.
 *
 * @function
 * @name fetchHourlyAverageConsumptionTotal
 * @param {string} startDate - La data di inizio del periodo (formato ISO 8601).
 * @param {string} endDate - La data di fine del periodo (formato ISO 8601).
 * @returns {Promise<Object>} Una promessa che risolve i dati di risposta dal server,
 *                            contenente le informazioni sul consumo medio orario e il valore costante.
 * @throws {Error} Se si verifica un errore durante il recupero dei dati, viene sollevato un errore con un messaggio descrittivo.
 */
export const fetchHourlyAverageConsumptionTotal = async (
  startDate,
  endDate,
  building = null
) => {
  try {
    // Invio della richiesta GET al server per recuperare i dati
    const response = await axiosInstance.get(
      `${BASE_API}/hourly-average-total-consumption`,
      {
        params: {
          startDate,
          endDate,
          building,
        },
      }
    );

    // Restituisce i dati ottenuti dal server
    return response.data;
  } catch (error) {
    console.error(
      "Errore nel recupero dei dati per i consumi orari medi:",
      error.message
    );
    // Solleva un errore per gestirlo successivamente
    throw new Error(
      "Errore durante il recupero dei consumi orari medi: " + error.message
    );
  }
};
