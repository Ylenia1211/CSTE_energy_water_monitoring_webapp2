/**
 * @fileoverview
 * Questo modulo gestisce le operazioni relative agli osservatori. Le funzioni disponibili permettono di aggiungere, rimuovere e ottenere gli osservatori,
 * oltre a verificare se un utente sta osservando.
 *
 * Questo viene utilizzato per gestire l'invio delle email di notifica solo agli utenti che lo hanno richiesto.
 *
 * Le operazioni vengono delegate al servizio `observerService` che si occupa della logica di business.
 *
 * @module observerController
 */

const observerService = require("../services/observerService");

/**
 * Aggiunge un nuovo osservatore basato sull'email fornita.
 * Se l'email non è fornita o si verifica un errore durante l'aggiunta dell'osservatore, viene restituito un errore appropriato.
 *
 * @async
 * @function addObserver
 * @param {Object} req - La richiesta HTTP che contiene l'email da aggiungere come osservatore nel corpo della richiesta (`req.body`).
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Object} - Un oggetto JSON che conferma l'aggiunta dell'osservatore.
 * @throws {Error} - Se non viene fornita un'email, restituisce un errore con codice 400. In caso di errore durante l'aggiunta, restituisce un errore 500.
 */
async function addObserver(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email richiesta" });
  }

  try {
    const newObserver = await observerService.addObserver(email);
    res
      .status(201)
      .json({ message: `Osservatore ${newObserver.email} aggiunto` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Rimuove un osservatore basato sull'email fornita.
 * Se l'email non è fornita o si verifica un errore durante la rimozione, viene restituito un errore appropriato.
 *
 * @async
 * @function removeObserver
 * @param {Object} req - La richiesta HTTP che contiene l'email da rimuovere come osservatore nel corpo della richiesta (`req.body`).
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Object} - Un oggetto JSON che conferma la rimozione dell'osservatore.
 * @throws {Error} - Se non viene fornita un'email, restituisce un errore con codice 400. In caso di errore durante la rimozione, restituisce un errore 500.
 */
async function removeObserver(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email richiesta" });
  }

  try {
    const message = await observerService.removeObserver(email);
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Restituisce la lista di tutti gli osservatori attuali.
 * Se si verifica un errore durante il recupero dei dati, viene restituito un errore appropriato.
 *
 * @async
 * @function getObservers
 * @param {Object} req - La richiesta HTTP, senza parametri specifici.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Array} - Un array di oggetti rappresentanti gli osservatori.
 * @throws {Error} - In caso di errore durante il recupero, restituisce un errore con codice 500.
 */
async function getObservers(req, res) {
  try {
    const observers = await observerService.getObservers();
    res.status(200).json(observers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Verifica se un utente, identificato dalla sua email, sta osservando.
 * Se l'email non è fornita o si verifica un errore durante la verifica, viene restituito un errore appropriato.
 *
 * @async
 * @function isUserObserving
 * @param {Object} req - La richiesta HTTP che contiene l'email da verificare come osservatore nella query string (`req.query`).
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Object} - Un oggetto JSON che indica se l'utente sta osservando (`isObserving: true/false`).
 * @throws {Error} - Se non viene fornita un'email, restituisce un errore con codice 400. In caso di errore durante la verifica, restituisce un errore 500.
 */
async function isUserObserving(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email non fornita" });
  }

  try {
    const isObserving = await observerService.isUserObserving(email);
    res.status(200).json({ isObserving });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addObserver,
  removeObserver,
  getObservers,
  isUserObserving,
};
