/**
 * @fileoverview
 * @namespace hooks
 * Questo file contiene un hook personalizzato `useBuildingFilters` che gestisce lo stato dei filtri applicati agli edifici e impianti.
 * Il hook permette di aggiornare e recuperare i filtri applicati, mantenendo una struttura centralizzata dello stato.
 *
 * @module useBuildingFilters
 */

import { useState } from "react";

/**
 * Custom hook per la gestione dei filtri per edifici e impianti.
 * Questo hook permette di impostare e aggiornare i filtri per selezionare gli edifici e gli impianti
 * da utilizzare nel grafico o in altre sezioni dell'applicazione.
 * @hook
 *
 * @returns {Object} - Un oggetto contenente le seguenti proprietà:
 *   - `filters`: Un oggetto che contiene i filtri correnti per edifici e impianti:
 *     - `buildings`: Un array di edifici selezionati.
 *     - `impianti`: Un array di impianti selezionati.
 *   - `updateFilters`: Funzione per aggiornare i filtri.
 */
const useBuildingFilters = () => {
  const [filters, setFilters] = useState({ buildings: [], impianti: [] });

  /**
   * Funzione per aggiornare i filtri.
   * @param {Object} newFilters - Nuovi filtri da applicare.
   * @param {Array} newFilters.buildings - Nuovo array di edifici selezionati.
   * @param {Array} newFilters.impianti - Nuovo array di impianti selezionati.
   * @returns {void}
   */
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return { filters, updateFilters };
};

export default useBuildingFilters;
