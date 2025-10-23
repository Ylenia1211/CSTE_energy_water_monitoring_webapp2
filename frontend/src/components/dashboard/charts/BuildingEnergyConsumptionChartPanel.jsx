/**
 * @fileoverview Componente React per visualizzare il grafico del consumo energetico per edificio e impianto.
 * Questo componente consente di selezionare un intervallo di tempo, applicare filtri per edifici e impianti,
 * e generare un grafico a barre. Inoltre, offre funzionalità di esportazione dei dati in formato Excel e PDF.
 *
 * @module BuildingEnergyConsumptionChartPanel
 */

import React, { useRef, useState, useEffect } from "react";
import {
  BarChart,
  getChartOptions,
  generateChartData,
} from "./base_chart/BarChart";
import TimeRangePicker from "../../common/TimeRangePicker";
import BuildingFilterSelect from "../../common/BuildingFilterSelect";
import useTimeRange from "../../../hooks/useTimeRange";
import useBuildingFilters from "../../../hooks/useBuildingFilters";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { exportQueryDataToExcel } from "../../../utils/exportAPI";
import { fetchBarChartDataByBuilding } from "../../../utils/consumiAPI";

/**
 * Custom hook per il recupero dei dati del grafico
 *
 * @param {Date} startDate - La data di inizio del periodo selezionato.
 * @param {Date} endDate - La data di fine del periodo selezionato.
 * @param {Object} filters - I filtri applicati, inclusi edifici e impianti.
 * @returns {Object} - Contiene `chartData` (i dati del grafico) e `loading` (lo stato di caricamento).
 */
const useBarChartData = (startDate, endDate, filters) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchBarChartDataByBuilding(
          startDate,
          endDate,
          filters.buildings,
          filters.impianti
        );
        console.log(startDate, endDate, filters);
        if (data && data.labels && data.datasets) {
          const generatedData = generateChartData(data.labels, data.datasets);
          setChartData(generatedData);
        } else {
          throw new Error("Dati non validi ricevuti dal server.");
        }
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, filters]);

  return { chartData, loading };
};

/**
 * Custom hook per la gestione delle funzionalità di esportazione dei dati
 *
 * @param {React.RefObject} chartRef - Riferimento al contenitore del grafico.
 * @param {Date} startDate - La data di inizio del periodo selezionato.
 * @param {Date} endDate - La data di fine del periodo selezionato.
 * @param {Object} filters - I filtri applicati, inclusi edifici e impianti.
 * @returns {Object} - Contiene le funzioni `handleExportToExcel` e `handleExportToPDF`.
 */
const useExport = (chartRef, startDate, endDate, filters) => {
  /**
   * Gestisce l'esportazione dei dati in formato Excel.
   *
   * @returns {Promise<void>}
   */
  const handleExportToExcel = async () => {
    try {
      await exportQueryDataToExcel(
        "BuildingEnergyConsumption",
        "energyDataService",
        "getNestedFields",
        {
          startDate,
          endDate,
          buildings: filters.buildings,
          impianti: filters.impianti,
        }
      );
    } catch (error) {
      console.error("Errore durante l'esportazione:", error.message);
    }
  };

  /**
   * Gestisce l'esportazione dei dati in formato PDF.
   *
   * @returns {void}
   */
  const handleExportToPDF = () => {
    if (chartRef.current) {
      const chartElement =
        chartRef.current.querySelector("canvas") || chartRef.current;
      html2canvas(chartElement).then((canvas) => {
        const pdf = new jsPDF("l", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");

        pdf.setFontSize(10);
        pdf.text(`Grafico Consumi per edificio e impianto`, 5, 5);
        pdf.setFontSize(10);
        pdf.text(
          `Periodo: ${new Date(startDate).toLocaleString()} - ${new Date(
            endDate
          ).toLocaleString()}`,
          10,
          20
        );
        pdf.text(
          `Filtri applicati: ${filters.buildings.join(
            ", "
          )}, ${filters.impianti.join(", ")}`,
          10,
          30
        );

        const imgWidth = 287;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        pdf.addImage(imgData, "PNG", 10, 40, imgWidth, imgHeight);
        pdf.save(`grafico_consumi_edificio.pdf`);
      });
    } else {
      console.error("Il contenitore del grafico non è stato trovato.");
    }
  };

  return { handleExportToExcel, handleExportToPDF };
};

/**
 * Componente principale per il pannello di consumo energetico per edificio.
 * Visualizza il grafico dei consumi in base ai filtri applicati e offre funzionalità di selezione dell'intervallo di tempo,
 * selezione dei filtri, e esportazione dei dati in Excel o PDF.
 *
 * @returns {JSX.Element} Il componente per visualizzare il pannello con il grafico e le opzioni di esportazione.
 */
const BuildingEnergyConsumptionChartPanel = () => {
  const chartRef = useRef();
  const { startDate, endDate, activeRange, handleSelectRange } = useTimeRange();
  const { filters, updateFilters } = useBuildingFilters();
  const { chartData, loading } = useBarChartData(startDate, endDate, filters);
  const { handleExportToExcel, handleExportToPDF } = useExport(
    chartRef,
    startDate,
    endDate,
    filters
  );

  /**
   * Gestisce la selezione dell'intervallo di tempo.
   *
   * @param {Date} start - La data di inizio selezionata.
   * @param {Date} end - La data di fine selezionata.
   * @param {string} range - L'intervallo di tempo selezionato (es. "day", "week", "month").
   * @returns {void}
   */
  const handleRangeSelect = (start, end, range) => {
    const formattedStartDate = start.toISOString().slice(0, 10);
    const formattedEndDate = end.toISOString().slice(0, 10);

    if (
      formattedStartDate !== startDate ||
      formattedEndDate !== endDate ||
      range !== activeRange
    ) {
      handleSelectRange(start, end, range);
    }
  };

  if (loading) {
    return <p>Caricamento dei dati... Attendere per favore.</p>;
  }

  if (!chartData) {
    return <p>Non ci sono dati disponibili per il periodo selezionato.</p>;
  }

  const chartOptions = getChartOptions("Consumo per edificio");

  return (
    <div>
      <div className="flex items-center justify-between space-x-6">
        <div className="flex-1">
          <TimeRangePicker
            defaultRange={activeRange}
            onSelectRange={handleRangeSelect}
          />
        </div>

        <div className="flex-1">
          <BuildingFilterSelect
            initialSelectedBuildings={filters.buildings}
            initialSelectedImpianti={filters.impianti}
            onFilterChange={updateFilters}
          />
        </div>
      </div>

      <div>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleExportToExcel}
        >
          Esporta in Excel
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleExportToPDF}
        >
          Esporta in PDF
        </button>
      </div>

      <div className="result-card p-6 bg-gray-100 rounded-lg">
        <p>
          <strong>Data Inizio:</strong> {new Date(startDate).toLocaleString()}
        </p>
        <p>
          <strong>Data Fine:</strong> {new Date(endDate).toLocaleString()}
        </p>
        <p>
          {filters.buildings.length > 0 && (
            <>
              <strong>Edifici:</strong> {filters.buildings.join(", ")}
            </>
          )}
          {filters.buildings.length > 0 && filters.impianti.length > 0 && (
            <>
              {" "}
              <strong>Impianti:</strong> {filters.impianti.join(", ")}
            </>
          )}
        </p>
      </div>
      <span ref={chartRef}>
        <BarChart data={chartData} options={chartOptions} />
      </span>
    </div>
  );
};

export default BuildingEnergyConsumptionChartPanel;
