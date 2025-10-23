/**
 * Punto di ingresso principale per l'applicazione React.
 *
 * Questo file configura e rende l'intera applicazione React, integrando Redux per la gestione dello stato
 * e Redux Persist per la persistenza dello stato tra i riavvii del browser.
 *
 * @module main
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react"; // Importa PersistGate
import { store, persistor } from "./utils/store"; // Usa persistor qui

/**
 * Renderizza l'applicazione React in modalità Strict.
 *
 * Utilizza StrictMode per abilitare funzionalità di controllo durante lo sviluppo,
 * come la gestione di errori e renderizzazioni non necessarie.
 *
 * @function
 * @name renderApp
 * @returns {void} Non restituisce nulla.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoutes />
      </PersistGate>
    </Provider>
  </StrictMode>
);
