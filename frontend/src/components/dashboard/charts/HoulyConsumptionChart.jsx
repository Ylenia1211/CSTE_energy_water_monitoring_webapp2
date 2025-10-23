/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `HourlyConsumptionChart`, che gestisce il rendering
 * di un grafico a barre per visualizzare il consumo medio orario. Il componente recupera i dati
 * di consumo tramite una chiamata API, gestisce filtri per edifici e impianti, e permette
 * di esportare il grafico in formato PDF. Inoltre, offre la possibilità di selezionare un intervallo
 * di tempo per filtrare i dati visualizzati.
 *
 * @module HourlyConsumptionChart
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  generateChartData,
  getChartOptions,
} from "./base_chart/BarChart";
import { fetchHourlyAverageConsumption } from "../../../utils/consumiAPI";
import BuildingFilterSelect from "../../common/BuildingFilterSelect";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useTimeRange from "../../../hooks/useTimeRange";
import TimeRangePicker from "../../common/TimeRangePicker";

/**
 * Componente React che visualizza un grafico a barre per il consumo medio orario.
 * Il componente recupera i dati dal server, applica i filtri per edifici e impianti,
 * e fornisce la possibilità di esportare il grafico in formato PDF.
 *
 * @component
 * @example
 * const example = (
 *   <HourlyConsumptionChart setDescription={fn} />
 * )
 *
 * @param {Object} props
 * @param {(desc: object) => void} [props.setDescription] - Callback per registrare metadati utili all’export.
 * @returns {JSX.Element} Il componente che renderizza il grafico a barre
 */
const HourlyConsumptionChart = ({ setDescription }) => {
  const { startDate, endDate, activeRange, handleSelectRange } =
    useTimeRange("week");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ buildings: [], impianti: [] });

  const chartRef = useRef(null);

  // Caricamento dati
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchHourlyAverageConsumption(
          startDate,
          endDate,
          filters.buildings,
          filters.impianti
        );

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

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, filters]);

  // Registra la description per l’export quando il grafico è pronto
  useEffect(() => {
    if (!setDescription) return;
    if (!chartData || !startDate || !endDate) return;

    const id = "panel_hourly_consumption";
    const title = "Consumi medi per edificio e impianto per orario";

    const tm = setTimeout(() => {
      setDescription({
        type: "chart",
        id,
        title,
        period: {
          start:
            startDate instanceof Date ? startDate.toISOString() : String(startDate),
          end: endDate instanceof Date ? endDate.toISOString() : String(endDate),
          range: activeRange,
        },
        filters: {
          buildings: filters.buildings,
          impianti: filters.impianti,
        },
        // Nodo radice contenente il grafico (canvas o svg)
        getNode: () => chartRef.current,
      });
    }, 0);

    return () => clearTimeout(tm);
  }, [setDescription, chartData, startDate, endDate, activeRange, filters]);

  // Gestione filtri
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Export PDF locale robusto
  const handleExportToPDF = () => {
    if (!chartRef.current) {
      console.error("Il contenitore del grafico non è stato trovato.");
      return;
    }

    const chartElement =
      chartRef.current.querySelector("canvas") || chartRef.current;

    html2canvas(chartElement, {
      useCORS: true,
      backgroundColor: null,
      scale: 3,
    }).then((canvas) => {
      const pdf = new jsPDF("l", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Header
      pdf.setFontSize(16);
      pdf.text("Consumo medio orario", 10, 12, { baseline: "top" });
      pdf.setFontSize(11);
      const startStr =
        startDate instanceof Date
          ? startDate.toLocaleDateString()
          : String(startDate);
      const endStr =
        endDate instanceof Date ? endDate.toLocaleDateString() : String(endDate);
      pdf.text(`Intervallo: ${startStr} - ${endStr}`, 10, 20, {
        baseline: "top",
      });

      const filtersLine = [
        filters.buildings.length ? `Edifici: ${filters.buildings.join(", ")}` : "",
        filters.impianti.length ? `Impianti: ${filters.impianti.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("  |  ");

      if (filtersLine) {
        pdf.text(filtersLine, 10, 28, { baseline: "top" });
      }

      // Dimensionamento immagine
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgX = margin;
      const imgY = 40;
      const maxW = pageWidth - margin * 2;
      const imgWidth = maxW;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      const maxH = pageHeight - imgY - margin;
      const scale = Math.min(1, maxH / imgHeight);
      const finalW = imgWidth * scale;
      const finalH = imgHeight * scale;

      pdf.addImage(imgData, "PNG", imgX, imgY, finalW, finalH);
      pdf.save(`grafico_consumo_orario.pdf`);
    });
  };

  if (loading) {
    return <p>Caricamento dei dati... Attendere per favore.</p>;
  }

  if (!chartData) {
    return <p>Non ci sono dati disponibili per il periodo selezionato.</p>;
  }

  const chartOptions = getChartOptions(
    `Consumo medio orario - ${startDate instanceof Date ? startDate.toLocaleDateString() : String(startDate)}`
  );

  return (
    <div>
      <div className="flex items-center justify-between space-x-6 mb-4">
        <TimeRangePicker
          defaultRange={activeRange}
          onSelectRange={(start, end, range) =>
            handleSelectRange(start, end, range)
          }
          isLoading={loading}
        />
        <BuildingFilterSelect
          initialSelectedBuildings={filters.buildings}
          initialSelectedImpianti={filters.impianti}
          onFilterChange={handleFilterChange}
        />
        <button
          onClick={handleExportToPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Esporta in PDF
        </button>
      </div>
      <div ref={chartRef} className="result-card p-6 bg-gray-100 rounded-lg">
        <BarChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default HourlyConsumptionChart;