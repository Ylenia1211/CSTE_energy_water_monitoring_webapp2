/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `ResultCard`, che visualizza le informazioni
 * relative al consumo energetico e al costo totale di un edificio. La card evidenzia gli
 * edifici con il costo più alto e più basso, utilizzando bordi colorati per renderli visibili.
 *
 * @module ResultCard
 */

import React from "react";

/**
 * Componente `ResultCard` che visualizza le informazioni di un edificio relative al consumo energetico,
 * al costo totale e alla relativa unità di misura. Il componente evidenzia gli edifici con il costo più alto
 * e più basso, utilizzando bordi rossi e verdi rispettivamente.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <ResultCard
 *   building="Edificio A"
 *   consumption="1500"
 *   unit="kWh"
 *   cost="300"
 *   isHighestCost={true}
 *   isLowestCost={false}
 * />
 *
 * @param {string} building - Il nome dell'edificio.
 * @param {string|number} consumption - Il consumo totale dell'edificio.
 * @param {string} unit - L'unità di misura del consumo (es. "kWh").
 * @param {string|number} cost - Il costo totale associato al consumo.
 * @param {boolean} isHighestCost - Se true, evidenzia la card con un bordo rosso per il costo più alto.
 * @param {boolean} isLowestCost - Se true, evidenzia la card con un bordo verde per il costo più basso.
 *
 * @returns {JSX.Element} Una card che visualizza le informazioni relative all'edificio, al consumo e al costo.
 */
const ResultCard = ({
  building,
  consumption,
  unit,
  cost,
  isHighestCost,
  isLowestCost,
}) => {
  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-md 
        ${isHighestCost ? "border-2 border-red-500" : ""}
        ${isLowestCost ? "border-2 border-green-500" : ""}`}
    >
      <p>
        <strong>Edificio:</strong> {building}
      </p>
      <p>
        <strong>Consumo Totale:</strong> {consumption} {unit}
      </p>
      <p>
        <strong>Costo Totale:</strong> {cost} Euro
      </p>
    </div>
  );
};

export default ResultCard;
