/**
 * @namespace pages
 * @fileoverview
 * Componente che visualizza una serie di pannelli per l'analisi avanzata dei consumi energetici.
 * Contiene grafici che mostrano i consumi per edificio, impianto e intervallo temporale.
 * I pannelli sono organizzati in un layout flessibile tramite il componente `PanelWrapper`.
 *
 * @module AdvancedAnalysis
 */

import React from "react";
import BuildingEnergyConsumptionChartPanel from "../components/dashboard/charts/BuildingEnergyConsumptionChartPanel";
import WeeklyBarChart from "../components/dashboard/charts/WeeklyBarChart";
import PanelWrapper from "../components/common/PanelWrapper";
import HourlyConsumptionChart from "../components/dashboard/charts/HoulyConsumptionChart";
import HourlyAverageConsumptionTotalChart from "../components/dashboard/charts/HourlyAverageConsumptionTotalChart";
import WaterConsumptionByBuildingChart from "../components/dashboard/charts/WaterConsumptionByBuildingChart";
import WaterCostByBuildingChart from "../components/dashboard/charts/WaterCostByBuildingChart";
     
/**
 * Elenco dei pannelli da visualizzare nell'analisi avanzata.
 * Ogni pannello contiene un titolo e il relativo contenuto.
 *
 * @type {Array<Object>}
 * @property {string} title - Il titolo del pannello.
 * @property {JSX.Element} content - Il contenuto da visualizzare nel pannello (grafico o altro componente).
 */
const panels = [
  {
    title: "Consumi energetici per edificio, impianto e per periodo personalizzato",
    content: <BuildingEnergyConsumptionChartPanel />,
  },
  {
    title: "Consumi energetici settimanali per edificio, impianto e per periodo personalizzato",
    content: <WeeklyBarChart />,
  },
  {
    title: "Consumi energetici medi per edificio e impianto per orario e per periodo personalizzato",
    content: <HourlyConsumptionChart />,
  },
  {
    title: "Consumi energetici medi per edificio per orario e per periodo personalizzato",
    content: <HourlyAverageConsumptionTotalChart />,
  },
  {
    title: "Consumo idrico per edificio (indirizzo) e per uno o più periodi (anno, mese, trimestre)",
    content: <WaterConsumptionByBuildingChart />,
  },
  {
    title: "Costo idrico per edificio (indirizzo) e per uno o più periodi (anno, mese, trimestre)", 
    content: <WaterCostByBuildingChart />
  }
];

/**
 * @component
 * Componente per l'analisi avanzata dei consumi energetici.
 * Mostra una serie di pannelli con grafici interattivi relativi ai consumi energetici,
 * organizzati in base a vari parametri (edificio, impianto, intervallo temporale).
 *
 * @returns {JSX.Element} - Il componente di analisi avanzata con pannelli.
 */
function AdvancedAnalysis() {
  return (
    <div className="p-4 flex flex-col flex-wrap justify-center">
      <PanelWrapper panels={panels} />
    </div>
  );
}

export default AdvancedAnalysis;
