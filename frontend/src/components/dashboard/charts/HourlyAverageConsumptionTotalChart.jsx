/**
 * @fileoverview
 * Questo file contiene il componente React `HourlyAverageConsumptionTotalChart`,
 * che visualizza un grafico a linee con i dati di consumo medio orario per un edificio selezionato.
 * Include funzionalità di selezione del periodo temporale, selezione dell'edificio,
 * zoom/pan sul grafico e opzioni di esportazione in PDF.
 *
 * @module HourlyAverageConsumptionTotalChart
 */

import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  fetchHourlyAverageConsumptionTotal,
  fetchMetersData,
} from "../../../utils/consumiAPI";
import useTimeRange from "../../../hooks/useTimeRange";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "chart.js/auto";
import Select from "react-select";
import zoomPlugin from "chartjs-plugin-zoom";
import annotationPlugin from "chartjs-plugin-annotation";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import TimeRangePicker from "../../common/TimeRangePicker";

// Registrazione dei componenti di Chart.js
ChartJS.register(
  LineElement,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  Filler,
  zoomPlugin,
  annotationPlugin
);

/**
 * Genera i dati strutturati per un grafico a linee basato sui dati di consumo medio orario.
 *
 * @param {Array<{hour:number, averageConsumption:number}>} data
 * @returns {{labels:string[], datasets:any[]}}
 */
const generateTimeSeriesData = (data) => {
  const labels = data.map((item) => `${item.hour.toString().padStart(2, "0")}:00`);

  const dataset = {
    label: "Consumo Medio Orario (kWh)",
    data: data.map((item) => item.averageConsumption),
    borderColor: "rgba(75, 192, 192, 1)",
    backgroundColor: "rgba(75, 192, 192, 0.2)",
    fill: true,
  };

  return { labels, datasets: [dataset] };
};

/**
 * Componente React che visualizza un grafico dei consumi medi orari per l'edificio selezionato.
 *
 * @param {{ setDescription?: (desc: object) => void }} props
 */
const HourlyAverageConsumptionTotalChart = ({ setDescription }) => {
  const { startDate, endDate, activeRange, handleSelectRange } = useTimeRange("week");
  const [data, setData] = useState(null);
  const [constantValue, setConstantValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const chartRef = useRef(null);

  // Recupera elenco edifici
  const fetchBuildings = async () => {
    try {
      const response = await fetchMetersData();
      if (response) {
        const buildingOptions = Object.keys(response).map((building) => ({
          value: building,
          label: building,
        }));
        setBuildings(buildingOptions);
      }
    } catch (error) {
      console.error("Errore nel recupero degli edifici:", error);
    }
  };

  // Recupera dati time series
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchHourlyAverageConsumptionTotal(
        startDate,
        endDate,
        selectedBuilding?.value || null
      );

      if (response?.error) {
        console.error("Errore nel recupero dei dati:", response.error);
        setData(null);
        return;
      }

      const chartData = generateTimeSeriesData(response.hourlyData || []);
      setConstantValue(response.constantValue ?? 0);
      setData(chartData);
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedBuilding]);

  // Registra la description per l'export quando il grafico è pronto
  useEffect(() => {
    if (!setDescription) return;
    if (!data || !startDate || !endDate) return;

    const id = "panel_hourly_avg_total";
    const title = "Consumi medi totali per orario (per edificio)";

    const tm = setTimeout(() => {
      setDescription({
        type: "chart",
        id,
        title,
        period: {
          start: startDate instanceof Date ? startDate.toISOString() : String(startDate),
          end: endDate instanceof Date ? endDate.toISOString() : String(endDate),
          range: activeRange,
        },
        filters: {
          building: selectedBuilding?.value || null,
        },
        // Nodo del wrapper che contiene <canvas> (Chart.js)
        getNode: () => chartRef.current,
      });
    }, 0);

    return () => clearTimeout(tm);
  }, [setDescription, data, startDate, endDate, activeRange, selectedBuilding]);

  // Export PDF locale robusto
  const handleExportToPDF = () => {
    if (!chartRef.current) {
      console.error("Il contenitore del grafico non è stato trovato.");
      return;
    }
    const chartElement = chartRef.current.querySelector("canvas") || chartRef.current;

    html2canvas(chartElement, {
      useCORS: true,
      backgroundColor: null,
      scale: 3,
    }).then((canvas) => {
      const pdf = new jsPDF("l", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Header
      pdf.setFontSize(16);
      pdf.text("Consumo medio per ora del giorno (totale edificio)", 10, 12, {
        baseline: "top",
      });
      pdf.setFontSize(11);
      const startStr =
        startDate instanceof Date ? startDate.toLocaleString() : String(startDate);
      const endStr =
        endDate instanceof Date ? endDate.toLocaleString() : String(endDate);
      const bld = selectedBuilding?.label || selectedBuilding?.value || "Tutti";
      pdf.text(`Periodo: ${startStr} - ${endStr}  |  Edificio: ${bld}`, 10, 20, {
        baseline: "top",
      });

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
      pdf.save(`grafico-consumi-orari-totale.pdf`);
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: {
      legend: { position: "top" },
      zoom: {
        pan: { enabled: true, mode: "xy", speed: 0.5, modifierKey: "ctrl" },
        zoom: { wheel: { enabled: true }, drag: { enabled: true }, mode: "xy" },
      },
      annotation: {
        annotations: {
          line1: {
            type: "line",
            yMin: constantValue,
            yMax: constantValue,
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Valore Medio Costante: ${Number(constantValue).toFixed(2)} kWh`,
              enabled: true,
              position: "center",
              backgroundColor: "rgba(255, 99, 132, 0.7)",
              font: { size: 14 },
            },
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Ora del Giorno" } },
      y: {
        title: { display: true, text: "Avg(Consumi) Orario" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="time-series-data">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Seleziona Edificio</h2>
        <Select
          options={buildings}
          value={selectedBuilding}
          onChange={setSelectedBuilding}
          placeholder="Seleziona un edificio..."
          isClearable
        />
      </div>

      <TimeRangePicker
        defaultRange={activeRange}
        onSelectRange={handleSelectRange}
        isLoading={isLoading}
        showRealtimeCheckbox={true}
      />

      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleExportToPDF}>
        Esporta in PDF
      </button>

      {isLoading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-6 h-6"></div>
        </div>
      )}

      <div className="results mt-8" ref={chartRef}>
        {data ? <Line data={data} options={chartOptions} /> : !isLoading && <p>Nessun dato disponibile.</p>}
      </div>
    </div>
  );
};

export default HourlyAverageConsumptionTotalChart;