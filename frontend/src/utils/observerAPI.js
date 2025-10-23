/**
 * @namespace utils
 * @fileoverview
 * Modulo per la gestione delle operazioni relative agli osservatori.
 *
 * Questo modulo esporta le funzioni per:
 * - Aggiungere un osservatore fornendo un'email.
 * - Rimuovere un osservatore fornendo un'email.
 * - Recuperare la lista di tutti gli osservatori.
 * - Verificare se un utente è già un osservatore.
 *
 * Ogni funzione interagisce con un'API di osservatori tramite l'istanza Axios configurata in precedenza.
 *
 * @module observersAPI
 * @requires axiosInstance
 */

import axiosInstance from "./api";

const BASE_API = "/observers";

/**
 * Rimuove un osservatore tramite l'email fornita.
 *
 * Invia una richiesta DELETE al server per rimuovere un osservatore con l'email specificata.
 * Se l'operazione ha successo, il server restituirà i dati di risposta.
 *
 * @function
 * @name removeObserver
 * @param {string} email - L'email dell'osservatore da rimuovere.
 * @returns {Promise<Object>} I dati di risposta dal server se la richiesta ha successo.
 * @throws {Error} Se la richiesta fallisce, l'errore viene sollevato con un messaggio adeguato.
 */
export const removeObserver = async (email) => {
  try {
    const response = await axiosInstance.delete(`${BASE_API}/removeObserver`, {
      data: { email },
    });
    return response.data; // Restituisce i dati se la richiesta è completata con successo
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};

/**
 * Aggiunge un nuovo osservatore tramite l'email fornita.
 *
 * Invia una richiesta POST al server per aggiungere un osservatore con l'email specificata.
 * Se l'operazione ha successo, il server restituirà i dati di risposta.
 *
 * @function
 * @name addObserver
 * @param {string} email - L'email dell'osservatore da aggiungere.
 * @returns {Promise<Object>} I dati di risposta dal server se la richiesta ha successo.
 * @throws {Error} Se la richiesta fallisce, l'errore viene sollevato con un messaggio adeguato.
 */
export const addObserver = async (email) => {
  try {
    const response = await axiosInstance.post(`${BASE_API}/addObserver`, {
      email,
    });
    return response.data; // Restituisce i dati se la richiesta è completata con successo
  } catch (error) {
    // Controlla se è un errore Axios e propaga il messaggio
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};

/**
 * Recupera la lista di tutti gli osservatori.
 *
 * Invia una richiesta GET al server per ottenere tutti gli osservatori registrati.
 * Se l'operazione ha successo, il server restituirà i dati di risposta.
 *
 * @function
 * @name getObservers
 * @returns {Promise<Array>} Una lista di osservatori.
 * @throws {Error} Se la richiesta fallisce, l'errore viene sollevato con un messaggio adeguato.
 */
export const getObservers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/getObservers`);
    return response.data; // Restituisce i dati se la richiesta è completata con successo
  } catch (error) {
    // Controlla se è un errore Axios e propaga il messaggio
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};

/**
 * Verifica se un utente (tramite email) è un osservatore.
 *
 * Invia una richiesta GET al server per verificare se un utente con l'email
 * fornita è un osservatore.
 *
 * @function
 * @name isUserObserving
 * @param {string} email - L'email dell'utente da verificare.
 * @returns {Promise<boolean>} Restituisce `true` se l'utente è un osservatore, altrimenti `false`.
 * @throws {Error} Se la richiesta fallisce, l'errore viene sollevato con un messaggio adeguato.
 */
export const isUserObserving = async (email) => {
  try {
    // Esegue la richiesta GET con l'email come parametro nella query
    const response = await axiosInstance.get(`${BASE_API}/isUserObserving`, {
      params: { email },
    });
    return response.data; // Restituisce il risultato della richiesta
  } catch (error) {
    // Gestisce gli errori e li propaga
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};
