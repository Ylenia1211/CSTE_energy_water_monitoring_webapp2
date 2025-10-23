/**
 * @namespace utils
 * @fileoverview
 * Gestisce la configurazione e la gestione degli errori per le richieste HTTP in un'applicazione.
 *
 * Questo modulo crea un'istanza personalizzata di Axios, configurata per supportare JWT
 * (JSON Web Token) tramite cookie di autenticazione. Include anche un sistema di gestione
 * degli errori globale che intercetta gli errori nelle risposte HTTP, come errori di rete e
 * errori di autenticazione (token scaduto o non valido), e gestisce il logout dell'utente
 * in caso di errore 401.
 *
 * Le funzionalità principali del modulo includono:
 * - Creazione di un'istanza personalizzata di Axios con configurazione per API.
 * - Gestione degli errori globali, tra cui la gestione di errori di rete e di autorizzazione.
 * - Interceptor globale per gestire le risposte delle richieste, con gestione degli errori centralizzata.
 *
 * Utilizzato in contesti dove è necessario inviare richieste HTTP a un'API protetta con autenticazione.
 *
 * @module axiosConfig
 */

import axios from "axios";
import { store } from "../utils/store"; // Importa lo store
import { logout } from "../slices/userSlice"; // Importa l'azione logout

/**
 * Crea una nuova istanza di Axios con configurazione personalizzata.
 *
 * Questa funzione crea una nuova istanza di Axios con una configurazione
 * personalizzata per le richieste HTTP, come l'URL di base, le intestazioni e
 * la gestione dei cookie. L'istanza di Axios viene configurata per inviare richieste
 * a un server API con supporto per JWT (cookie di autenticazione).
 *
 * @typedef {Object} AxiosInstance
 * @property {string} baseURL - L'URL di base per le richieste HTTP.
 * @property {Object} headers - Le intestazioni predefinite per le richieste.
 * @property {boolean} withCredentials - Indica se includere i cookie nelle richieste (necessario per JWT).
 */

/**
 * Crea un'istanza personalizzata di Axios.
 *
 * @type {AxiosInstance}
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5555",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Includi cookie (necessario per JWT)
});

/**
 * Gestisce globalmente gli errori delle risposte HTTP.
 *
 * Questa funzione intercetta gli errori nelle risposte delle richieste HTTP
 * e fornisce una gestione centralizzata degli errori. Gestisce:
 * - Gli errori di rete (ad esempio, impossibile connettersi al server).
 * - Gli errori di autorizzazione (ad esempio, codice di stato 401, token scaduto o non valido).
 * - Effettua il logout dell'utente in caso di errore 401.
 *
 * @param {Object} error - L'errore generato dalla richiesta Axios.
 * @param {Object} error.response - La risposta dell'errore (se presente).
 * @param {number} error.response.status - Il codice di stato della risposta HTTP.
 * @returns {Promise} Restituisce una promessa che respinge l'errore per propagarlo.
 */
const handleGlobalError = (error) => {
  // Verifica se è un errore di rete o se l'errore è causato da una risposta 401 (token scaduto)
  if (!error.response) {
    console.error("Errore di connessione al server.");
    alert("Impossibile connettersi al server.");
  }

  const status = error.response ? error.response.status : null;

  if (status === 401) {
    // Se il codice di stato è 401 (token scaduto o non valido)
    // alert("Il tuo token è scaduto. Riprova a fare il login.");

    // Dispatch l'azione logout per aggiornare lo stato di Redux
    store.dispatch(logout());
  }

  return Promise.reject(error); // Propaga l'errore
};

/**
 * Aggiunge un interceptor globale per gestire le risposte.
 *
 * Questo interceptor:
 * - Gestisce le risposte con successo, restituendo i dati.
 * - Gestisce gli errori delle risposte, inclusi gli errori 401, tramite la funzione `handleGlobalError`.
 *
 * @function
 * @name responseInterceptor
 * @param {Object} response - La risposta HTTP.
 * @param {Object} error - L'errore in caso di risposta fallita.
 * @returns {Promise} Restituisce la risposta se ha successo, altrimenti il Promise di errore.
 */
axiosInstance.interceptors.response.use(
  (response) => response, // Se la richiesta ha successo
  handleGlobalError // Se la richiesta fallisce (includendo 401)
);

export default axiosInstance;
