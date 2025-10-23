/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `TabMenuItem`, che rappresenta un singolo elemento di navigazione
 * nel menu a tab. Il componente utilizza `react-router-dom` per la gestione della navigazione tra le pagine
 * e evidenzia l'elemento selezionato in base al percorso corrente.
 *
 * @module TabMenuItem
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Componente che rappresenta un elemento di menu a tab. Determina se il tab è attivo in base al percorso
 * corrente e applica uno stile di evidenza. Il tab è cliccabile e permette la navigazione tra le diverse pagine
 * dell'applicazione.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <TabMenuItem to="/dashboard/home" label="Home" />
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {string} props.to - Il percorso di destinazione per il link.
 * @param {string} props.label - Il testo da visualizzare nell'elemento del menu.
 *
 * @returns {JSX.Element} Il link che rappresenta un elemento del menu a tab.
 */
const TabMenuItem = ({ to, label }) => {
  const location = useLocation();

  // Determina se il tab è attivo
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-semibold rounded-t-md transition duration-200 ${
        isActive ? "bg-gray-700" : "hover:bg-gray-700"
      }`}
    >
      {label}
    </Link>
  );
};

export default TabMenuItem;
