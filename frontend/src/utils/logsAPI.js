/**
 * @namespace utils
 * @fileoverview
 * Questo modulo gestisce l'interazione con l'API per il recupero dei logs.
 * In particolare, offre una funzione per ottenere i logs filtrati in base a determinati parametri.
 * La funzione principale è:
 *
 * 1. **getLogs**: Recupera i logs dal server in base ai filtri passati come parametri.
 *
 * Ogni richiesta inviata tramite questo modulo è una GET alla rotta `/getFilteredLogs` dell'API,
 * che restituirà i logs filtrati in base ai criteri specificati.
 *
 * Questo modulo si basa su Axios per le richieste HTTP.
 *
 * @module logsAPI
 * @requires axiosInstance
 *
 */

import axiosInstance from "./api";

const BASE_API = "/logs";

/**
 * Recupera i logs dal server in base ai filtri specificati.
 *
 * Questa funzione invia una richiesta GET al backend, passando i filtri come parametri della query
 * per ottenere i logs che soddisfano i criteri forniti. Se la richiesta è riuscita, i logs vengono
 * restituiti sotto forma di dati JSON.
 *
 * @param {Object} [filters={}] - I filtri da applicare ai logs. Ogni filtro viene inviato come parametro di query.
 * @returns {Promise<Object>} Una promessa che restituisce i logs filtrati dal server.
 *
 * @throws {Error} Se si verifica un errore nella richiesta o se la connessione al server fallisce.

 */
export const getLogs = async (filters = {}) => {
  console.log(filters);
  try {
    const response = await axiosInstance.get(`${BASE_API}/getFilteredLogs`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};
