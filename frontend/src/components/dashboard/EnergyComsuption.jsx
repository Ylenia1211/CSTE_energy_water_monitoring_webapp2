/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `EnergyConsumption`, che permette di visualizzare il consumo
 * energetico totale in un dato intervallo di tempo. Il componente consente all'utente di selezionare un intervallo
 * di tempo tramite un componente `TimeRangePicker`, eseguire una richiesta per ottenere i consumi energetici
 * e mostrare i risultati, incluso il consumo totale e il costo associato.
 *
 * @module EnergyConsumption
 */

import React, { useState, useEffect } from "react";
import { fetchTotalConsumption } from "../../utils/consumiAPI";
import TimeRangePicker from "../common/TimeRangePicker"; // Importa il TimeRangePicker
import useTimeRange from "../../hooks/useTimeRange";

/**
 * Componente per visualizzare il consumo energetico totale in un intervallo di tempo selezionato.
 * Consente all'utente di selezionare un intervallo tramite un componente `TimeRangePicker`,
 * recupera i dati di consumo e visualizza i risultati, inclusi il consumo totale e il costo.
 *
 * @component
 * @example
 * return (
 *   <EnergyConsumption />
 * );
 *
 * @returns {JSX.Element} Componente React per la visualizzazione dei consumi energetici.
 */
const EnergyConsumption = () => {
  const { startDate, endDate, activeRange, handleSelectRange } =
    useTimeRange("week"); // Usa l'hook

  const [consumptionData, setConsumptionData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Funzione per recuperare i dati di consumo energetico.
   * Esegue una richiesta all'API per ottenere i consumi nel periodo definito dalle date `startDate` e `endDate`.
   *
   * @async
   * @function
   * @returns {void}
   */
  const fetchConsumptionData = async () => {
    if (!startDate || !endDate) return; // Se le date non sono impostate, non fare la richiesta
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTotalConsumption(startDate, endDate);
      setConsumptionData(data);
    } catch (err) {
      console.error("Errore durante il recupero dei dati:", err.message);
      setError("Impossibile recuperare i consumi. Verifica le date.");
    } finally {
      setIsLoading(false);
    }
  };

  // Esegui il fetch dei dati quando le date sono impostate
  useEffect(() => {
    if (startDate && endDate) {
      fetchConsumptionData();
    }
  }, [startDate, endDate]);

  return (
    <div className="energy-consumption">
      <TimeRangePicker
        defaultRange={activeRange}
        onSelectRange={handleSelectRange} // Passa la logica al componente TimeRangePicker
        isLoading={isLoading} // Passa lo stato di caricamento
      />

      {isLoading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-6 h-6"></div>
        </div>
      )}

      <div className="results mt-8">
        {error && <p className="text-red-500">{error}</p>}
        {consumptionData ? (
          <div className="result-card p-6 bg-gray-100 rounded-lg">
            <p>
              <strong>Data Inizio:</strong>{" "}
              {new Date(consumptionData.startDate).toLocaleString()}
            </p>
            <p>
              <strong>Data Fine:</strong>{" "}
              {new Date(consumptionData.endDate).toLocaleString()}
            </p>
            <p className="text-xl mt-4">
              Consumo Energetico Totale:{" "}
              {Math.round(consumptionData.consumption)} {consumptionData.unit}
            </p>
            <p>
              <strong>Costo Totale:</strong>{" "}
              {(consumptionData.consumption * 0.12).toFixed(2)} Euro
            </p>
          </div>
        ) : (
          <p>Nessun dato disponibile.</p>
        )}
      </div>
    </div>
  );
};

export default EnergyConsumption;
