/**
 * @namespace pages
 * @fileoverview
 * Componente per la visualizzazione degli edifici e dei pannelli relativi ai dati.
 * Questo componente permette all'utente di selezionare un filtro sugli edifici
 * e visualizzare diversi pannelli con dati di tipo temporale (come corrente, voltaggio, potenza, ecc.).
 *
 * @module Edifici
 */

import React from "react";
import BuildingFilterSelect from "../components/common/BuildingFilterSelect"; // Importa il filtro
import PanelWrapper from "../components/common/PanelWrapper"; // Importa il wrapper dei pannelli
import TimeSeriesDataComponent from "../components/dashboard/charts/TimeSeriesDataComponent";
import { useFilters } from "../context/filterContext"; // Importa l'hook per accedere ai filtri

/**
 * Dati per i pannelli da visualizzare.
 * Ogni pannello contiene un titolo e un contenuto, che è un componente che visualizza i dati temporali.
 *
 * @type {Array<Object>}
 * @property {string} title - Il titolo del pannello.
 * @property {JSX.Element} content - Il contenuto da visualizzare nel pannello (grafico o altro componente).
 */
const panels = [
  {
    title: "Corrente",
    content: (
      <TimeSeriesDataComponent fieldName="A" unit="A" title="Corrente" />
    ),
  },
  {
    title: "Voltaggio",
    content: (
      <TimeSeriesDataComponent fieldName="PhV" unit="V" title="Voltaggio" />
    ),
  },
  {
    title: "Potenza totale attiva",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotW"
        unit="W"
        title="Potenza totale attiva"
      />
    ),
  },
  {
    title: "Potenza totale apparente",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotVA"
        unit="kVA"
        title="Potenza totale apparente"
      />
    ),
  },
  {
    title: "Potenza totale reattiva",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotVAr"
        unit="VAr"
        title="Potenza totale reattiva"
      />
    ),
  },
  {
    title: "Energia totale attiva - Import/Export",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotWh"
        unit="kWh"
        title="Energia totale attiva - Import/Export"
      />
    ),
  },
  {
    title: "Energia totale apparente - Import/Export",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotVA"
        unit="kVA"
        title="Energia totale apparente - Import/Export"
      />
    ),
  },
  {
    title: "Energia totale reattiva - Import/Export",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotVArh"
        unit="kVArh"
        title="Energia totale reattiva - Import/Export"
      />
    ),
  },
  {
    title: "Fattore di potenza",
    content: (
      <TimeSeriesDataComponent
        fieldName="TotPF"
        unit="W/VA"
        title="Fattore di potenza"
      />
    ),
  },
  {
    title: "Frequenza",
    content: (
      <TimeSeriesDataComponent
        fieldName="frequency"
        unit="Hz"
        title="Frequenza"
      />
    ),
  },
];

/**
 * @component
 * Componente per la visualizzazione degli edifici e dei dati di energia associati.
 *
 * Questo componente permette all'utente di selezionare un filtro per gli edifici tramite
 * il componente `BuildingFilterSelect` e visualizza diversi pannelli con dati temporali come
 * corrente, voltaggio, potenza, ecc. I pannelli sono visualizzati usando il componente `PanelWrapper`.
 *
 * @returns {JSX.Element} Il layout per la gestione dei filtri e la visualizzazione dei pannelli.
 */
const Edifici = () => {
  // Stato per i filtri degli edifici e impianti
  const { updateFilters } = useFilters();

  /**
   * Funzione di callback per la gestione dei cambiamenti nei filtri.
   * Quando un filtro viene modificato, aggiorna i filtri nel contesto globale.
   *
   * @param {Object} newFilters - I nuovi filtri da applicare.
   */
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  return (
     
    <div className="p-2 flex flex-col flex-wrap justify-center">
      {/* Filtro degli edifici (Bisogna aggiungere anche il filtro realtime*/}
      <div className="">
        <BuildingFilterSelect
          onFilterChange={handleFilterChange}
          darkMode={true}
        />
      </div>

      {/* Wrapper per i pannelli passati come props*/}
      <PanelWrapper panels={panels} />

    </div>
   
  );
};

export default Edifici;
