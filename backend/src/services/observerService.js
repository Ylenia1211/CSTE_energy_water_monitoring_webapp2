/**
 * @fileoverview
 * Questo modulo gestisce la logica per l'aggiunta, la rimozione e il recupero degli osservatori nel sistema.
 * Utilizza il modello `Observer` per interagire con il database e mantiene l'elenco degli osservatori tramite il loro indirizzo email.
 *
 * Le operazioni supportate includono:
 * - Aggiungere un nuovo osservatore.
 * - Rimuovere un osservatore esistente.
 * - Recuperare tutti gli osservatori.
 * - Verificare se un utente è un osservatore.
 *
 * @module observerService
 */

const Observer = require("../models/observerModel");

/**
 * Aggiunge un nuovo osservatore al sistema.
 * Se l'osservatore esiste già, viene sollevato un errore.
 *
 * @function addObserver
 * @param {string} email - L'email dell'osservatore da aggiungere.
 * @returns {Promise<Object>} L'oggetto dell'osservatore creato.
 * @throws {Error} Se l'osservatore esiste già o si verifica un errore durante l'aggiunta.
 * @example
 * // Aggiungi un nuovo osservatore
 * const newObserver = await observerService.addObserver('example@email.com');
 * console.log(newObserver);
 */
async function addObserver(email) {
  try {
    const existingObserver = await Observer.findOne({ email });
    if (existingObserver) {
      throw new Error("Osservatore già esistente");
    }

    const newObserver = new Observer({ email });
    await newObserver.save();
    return newObserver;
  } catch (error) {
    throw new Error(`Errore nell'aggiunta dell'osservatore: ${error.message}`);
  }
}

/**
 * Rimuove un osservatore dal sistema in base all'email fornita.
 * Se l'osservatore non esiste, viene sollevato un errore.
 *
 * @function removeObserver
 * @param {string} email - L'email dell'osservatore da rimuovere.
 * @returns {Promise<string>} Un messaggio che conferma la rimozione dell'osservatore.
 * @throws {Error} Se non viene trovato alcun osservatore o se si verifica un errore durante la rimozione.
 * @example
 * // Rimuovi un osservatore
 * const message = await observerService.removeObserver('example@email.com');
 * console.log(message);
 */
async function removeObserver(email) {
  try {
    const result = await Observer.deleteOne({ email });
    if (result.deletedCount === 0) {
      throw new Error("Osservatore non trovato");
    }
    return `Osservatore ${email} rimosso`;
  } catch (error) {
    throw new Error(
      `Errore nella rimozione dell'osservatore: ${error.message}`
    );
  }
}

/**
 * Recupera tutti gli osservatori nel sistema.
 *
 * @function getObservers
 * @returns {Promise<Array>} Un array di oggetti che rappresentano gli osservatori nel sistema.
 * @throws {Error} Se si verifica un errore durante il recupero degli osservatori.
 * @example
 * // Recupera la lista di tutti gli osservatori
 * const observers = await observerService.getObservers();
 * console.log(observers);
 */
async function getObservers() {
  try {
    return await Observer.find();
  } catch (error) {
    throw new Error(`Errore nella ricerca degli osservatori: ${error.message}`);
  }
}

/**
 * Verifica se un utente (tramite email) è un osservatore nel sistema.
 *
 * @function isUserObserving
 * @param {string} email - L'email dell'utente da verificare.
 * @returns {Promise<boolean>} `true` se l'utente è un osservatore, altrimenti `false`.
 * @throws {Error} Se si verifica un errore durante la query nel database.
 * @example
 * // Verifica se un utente è un osservatore
 * const isObserving = await observerService.isUserObserving('example@email.com');
 * console.log(isObserving); // true o false
 */
async function isUserObserving(email) {
  try {
    const observer = await Observer.findOne({ email: email });
    return !!observer; // Restituisce true se esiste, altrimenti false
  } catch (error) {
    throw new Error("Errore nella query del database: " + error.message);
  }
}

module.exports = {
  addObserver,
  removeObserver,
  getObservers,
  isUserObserving,
};
