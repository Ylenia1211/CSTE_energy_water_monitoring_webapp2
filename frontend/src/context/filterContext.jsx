/**
 * @fileoverview
 * @namespace context
 * Questo file contiene il contesto e i metodi associati per la gestione dei filtri nell'applicazione.
 * Il `FilterContext` viene utilizzato per fornire e consumare i filtri relativi agli edifici e agli impianti.
 * Viene usato un `FilterProvider` per gestire lo stato dei filtri a livello globale, e il custom hook `useFilters` per
 * accedere facilmente ai filtri nei componenti.
 *
 * @module FilterContext
 */

import React, { createContext, useState, useContext } from "react";

/**
 * Crea un contesto per i filtri.
 * Il contesto è utilizzato per fornire e gestire lo stato dei filtri applicati per edifici e impianti.
 *
 * @constant
 * @type {React.Context}
 */
const FilterContext = createContext();

/**
 * Custom hook per accedere al contesto dei filtri.
 *
 * Questo hook consente di accedere al contesto dei filtri all'interno di un componente.
 * Se usato fuori dal `FilterProvider`, genera un errore.
 *
 * @hook
 * @throws {Error} Se il contesto non è disponibile, ad esempio se il componente non è racchiuso in un `FilterProvider`.
 *
 * @returns {Object} Oggetto contenente i filtri e la funzione per aggiornarli.
 */
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

/**
 * Componente provider per il contesto dei filtri.
 *
 * Fornisce lo stato dei filtri e la funzione per aggiornarli a tutti i componenti discendenti.
 * I filtri sono gestiti come uno stato locale e possono essere modificati tramite la funzione `updateFilters`.
 *
 * @component
 *
 * @param {ReactNode} children - I componenti figli che avranno accesso al contesto dei filtri.
 *
 * @returns {JSX.Element} Il componente `FilterProvider` che avvolge i componenti figli.
 */
export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({ buildings: [], impianti: [] });

  /**
   * Funzione per aggiornare i filtri.
   * Permette di aggiornare i filtri applicati, unendo i nuovi filtri con quelli esistenti.
   *
   * @param {Object} newFilters - Nuovi filtri da applicare.
   */
  const updateFilters = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
