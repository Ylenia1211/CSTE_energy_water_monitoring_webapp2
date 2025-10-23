/**
 * @namespace slices
 * @fileoverview Redux slice per la gestione dell'autenticazione e dei dati utente.
 * Questo modulo contiene il reducer che gestisce l'accesso dell'utente,
 * l'aggiornamento dei dettagli dell'utente, e la disconnessione.
 *
 * @module userSlice
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: {},
  token: null,
};

/**
 * Serializza i payload non serializzabili prima di inviarli all'azione.
 * @param {Object} store - Il negozio Redux.
 * @returns {Function} - La funzione middleware.
 */
const serializableMiddleware = (store) => (next) => (action) => {
  if (action.payload && typeof action.payload === "object") {
    // Converti l'intero payload in una stringa
    action.payload = JSON.stringify(action.payload);
  }
  return next(action);
};

/**
 * @typedef {Object} User
 * @property {string} username - Nome utente dell'utente.
 * @property {string} email - Email dell'utente.
 * @property {string} role - Ruolo dell'utente ('admin', 'user', etc).
 * @property {string} token - Token di autenticazione dell'utente.
 */

/**
 * @typedef {Object} UserState
 * @property {boolean} isAuthenticated - Stato di autenticazione dell'utente.
 * @property {User} user - I dati dell'utente autenticato.
 * @property {string|null} token - Il token di autenticazione dell'utente.
 */

/**
 * Crea un Redux slice per gestire lo stato dell'utente.
 */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Aggiunge l'utente allo stato quando effettua il login.
     * @param {UserState} state - Lo stato dell'utente.
     * @param {Object} action - L'azione contenente i dati dell'utente.
     * @param {User} action.payload - I dati dell'utente da aggiungere allo stato.
     */
    login(state, action) {
      state.isAuthenticated = true;
      // state.username = action.payload.user.username;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.user = action.payload.user; // role e username
    },

    /**
     * Aggiorna i dettagli dell'utente.
     * @param {UserState} state - Lo stato dell'utente.
     * @param {Object} action - L'azione contenente i nuovi dettagli dell'utente.
     * @param {User} action.payload - I nuovi dettagli dell'utente da aggiornare.
     */
    updateUser(state, action) {
      state.user = action.payload; // Aggiorna lo stato con i nuovi dati dell'utente
    },

    /**
     * Resetta lo stato dell'utente e disconnette l'utente.
     * @param {UserState} state - Lo stato dell'utente.
     */
    logout(state) {
      state.isAuthenticated = false;
      state.username = null;
      state.role = null;
      state.user = null;
      state.token = null;
    },
  },
  /**
   * Aggiunge il middleware personalizzato per serializzare i payload non serializzabili.
   * @param {Function} getDefaultMiddleware - Funzione per ottenere il middleware di default.
   * @returns {Function} - Il middleware combinato.
   */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(serializableMiddleware),
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
