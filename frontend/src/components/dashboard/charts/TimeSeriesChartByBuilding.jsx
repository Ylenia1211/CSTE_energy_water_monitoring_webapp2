/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `TimeSeriesChartByBuilding`, che visualizza un grafico a
 * linee (time series) per un dato campo (come il consumo energetico) in base a edifici e impianti.
 * Il componente consente di selezionare un intervallo di tempo e applicare filtri per edifici e impianti,
 * recuperando i dati tramite un'API. Il grafico visualizza i dati in base al campo fornito come `fieldName`.
 * Inoltre, il componente supporta l'aggiornamento dinamico dei dati in base alla selezione di un intervallo
 * temporale e dei filtri.
 *
 * @module TimeSeriesChartByBuilding
 */

import React, { useState, useEffect } from "react";
import {
  TimeSeriesChart,
  generateTimeSeriesData,
} from "./base_chart/TimeSeriesChart";
import { fetchNestedFieldData } from "../../../utils/consumiAPI";

import TimeRangePicker from "../../common/TimeRangePicker";
import BuildingFilterSelect from "../../common/BuildingFilterSelect";

import useTimeRange from "../../../hooks/useTimeRange";

/**
 * Componente React che visualizza un grafico a linee (time series) per i dati di consumo
 * di un campo specifico (ad esempio consumo energetico) su base temporale.
 * Il componente consente di selezionare un intervallo di tempo e applicare filtri su edifici e impianti.
 * Inoltre, supporta l'aggiornamento dinamico dei dati in base ai filtri e all'intervallo selezionato.
 *
 * @component
 * @example
 * const example = (
 *   <TimeSeriesChartByBuilding
 *     fieldName="TotW"
 *     unit="kWh"
 *     title="Consumo Energetico"
 *   />
 * )
 *
 * @param {string} fieldName - Il nome del campo per cui si vogliono visualizzare i dati (es. "energy_consumption").
 * @param {string} unit - L'unità di misura del campo (es. "kWh").
 * @param {string} title - Il titolo da visualizzare per il grafico.
 * @param {Function|null} setDescription - Funzione opzionale per passare la descrizione dei filtri e intervallo.
 *
 * @returns {JSX.Element} Il componente che renderizza il grafico a linee
 */
const TimeSeriesChartByBuilding = ({
  fieldName,
  unit,
  title,
  setDescription = null,
}) => {
  const { startDate, endDate, activeRange, handleSelectRange } =
    useTimeRange("week");
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ buildings: [], impianti: [] });

  useEffect(() => {
    // Passiamo i dati per creare una descrizione al componente padre
    setDescription({ startDate, endDate, filters, title });
  }, [title, setDescription, startDate, endDate, filters]);

  /**
   * Funzione che recupera i dati di consumo da un'API per un determinato campo
   * (come consumo energetico) e li trasforma in un formato utilizzabile dal grafico.
   *
   * @async
   * @function
   * @returns {void}
   */
  const fetchConsumptionData = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const rawData = await fetchNestedFieldData(
        fieldName,
        startDate,
        endDate,
        filters.buildings,
        filters.impianti
      );

      if (rawData.error) {
        setError(rawData.error);
        return;
      }

      const transformedData = generateTimeSeriesData(rawData, fieldName);
      setLabels(transformedData.labels);
      setDatasets(transformedData.datasets);
    } catch (err) {
      console.error("Errore durante il recupero dei dati:", err.message);
      setError("Impossibile recuperare i dati. Verifica le date.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gestisce il cambiamento dei filtri applicati, come edifici e impianti selezionati.
   *
   * @function
   * @param {Object} newFilters - Nuovi filtri da applicare
   * @param {Array} newFilters.buildings - Gli edifici selezionati
   * @param {Array} newFilters.impianti - Gli impianti selezionati
   * @returns {void}
   */
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Effettua una chiamata per aggiornare i dati ogni volta che cambiano i filtri o l'intervallo di tempo.
   *
   * @async
   * @function
   * @returns {void}
   */
  useEffect(() => {
    if (startDate && endDate) {
      fetchConsumptionData();
    }
  }, [startDate, endDate, filters]);

  return (
    <div className="time-series-data p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <TimeRangePicker
          defaultRange={activeRange}
          onSelectRange={handleSelectRange}
          isLoading={isLoading}
          showRealtimeCheckbox={true}
        />
        <BuildingFilterSelect onFilterChange={handleFilterChange} />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-6 h-6"></div>
        </div>
      )}

      <div className="results mt-6">
        {error && <p className="text-red-500">{error}</p>}
        {labels.length > 0 && datasets.length > 0 ? (
          <TimeSeriesChart
            labels={labels}
            datasets={datasets}
            title={title}
            unit={unit}
          />
        ) : (
          !isLoading && (
            <p className="text-gray-500">Nessun dato disponibile.</p>
          )
        )}
      </div>
    </div>
  );
};

export default TimeSeriesChartByBuilding;
