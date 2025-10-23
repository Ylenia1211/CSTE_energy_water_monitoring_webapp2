/**
 * @namespace utils
 * @fileoverview
 * Modulo per la gestione delle operazioni relative alle query disponibili (NON UTILIZZATO).
 *
 * Questo modulo esporta la funzione per ottenere tutte le query disponibili tramite una richiesta al server.
 *
 * Ogni funzione interagisce con l'API delle query tramite l'istanza Axios configurata in precedenza.
 *
 * @module queriesAPI
 * @requires axiosInstance
 */

import axiosInstance from "./api";

const BASE_API = "/queries";

/**
 * Ottiene tutte le query disponibili dal server.
 *
 * Invia una richiesta GET al server per ottenere un elenco di tutte le query
 * disponibili. Se l'operazione ha successo, il server restituirà un array
 * di query.
 *
 * @function
 * @name getAvailableQueries
 * @returns {Promise<Array>} Una promessa che risolve con l'elenco delle query disponibili.
 * @throws {Error} Se la richiesta fallisce, l'errore viene sollevato con un messaggio adeguato.
 */
export const getAvailableQueries = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/all`);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};
