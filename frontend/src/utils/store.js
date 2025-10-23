/**
 * @namespace utils
 * @fileoverview
 * Questo file configura lo store Redux con persistenza usando redux-persist.
 * La configurazione prevede l'uso di localStorage per memorizzare lo stato persistente dei slice specificati (ad esempio, `user`, `isAuthenticated`, `role`).
 * Viene utilizzato un middleware per ignorare la serializzazione di alcune azioni, come quelle relative alla persistenza e il campo `token` all'interno dello slice `user`.
 * La persistenza consente di mantenere i dati dell'utente (ad esempio, lo stato di autenticazione) anche dopo il riavvio dell'applicazione.
 * Il middleware è configurato per non serializzare dati specifici come il `token`, che potrebbe non essere serializzabile.
 *
 * @module store
 * @requires userSlice
 */

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Usa localStorage
import userReducer from "../slices/userSlice";

/**
 * Configurazione di Redux Persist per la persistenza dello stato.
 * Questo oggetto specifica la chiave di persistenza e il tipo di storage da utilizzare (localStorage).
 * Si applica solo a determinati slice come 'user', 'isAuthenticated', 'role'.
 *
 * @type {Object}
 * @property {string} key - La chiave utilizzata per memorizzare lo stato persistente.
 * @property {Object} storage - Il tipo di storage da usare per la persistenza (localStorage in questo caso).
 * @property {Array<string>} whitelist - L'elenco dei slice che devono essere persistiti.
 */
const persistConfig = {
  key: "root", // La chiave di persistenza
  storage, // Utilizza localStorage
  whitelist: ["user", "isAuthenticated", "role"], // Slice da persistere
};

/**
 * Crea il reducer persistito per il slice 'user'.
 * @type {Function}
 */
const persistedUserReducer = persistReducer(persistConfig, userReducer);

/**
 * Crea lo store Redux con supporto per la persistenza.
 * Configura il middleware per ignorare la serializzazione di determinate azioni (ad esempio azioni di persistenza).
 *
 * @returns {Object} - Lo store Redux configurato
 */
const store = configureStore({
  reducer: {
    user: persistedUserReducer, // Usa il reducer persistito per la slice 'user'
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora la serializzazione per azioni specifiche
        ignoredActions: ["persist/PERSIST"],
        ignoredPaths: ["user.token"], // Ignora la serializzazione del campo 'token'
      },
    }),
});

/**
 * Crea il persistor per gestire la persistenza dello store.
 * Il persistor è utilizzato per sincronizzare lo stato persistente con il localStorage.
 *
 * @type {Object}
 */
const persistor = persistStore(store);

export { store, persistor };
