/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React WeeklyBarChart, che visualizza un grafico a barre settimanale
 * basato sui dati di consumo energetico per edifici e impianti. Gli utenti possono selezionare la settimana
 * tramite un input di tipo "week", applicare filtri su edifici e impianti, e visualizzare i dati corrispondenti
 * in un grafico interattivo. Il componente offre anche funzionalità di esportazione in Excel e PDF.
 *
 * @module WeeklyBarChart
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  generateChartData,
  getChartOptions,
} from "./base_chart/BarChart";
import { fetchWeeklyBarChartDataByBuilding } from "../../../utils/consumiAPI";
import BuildingFilterSelect from "../../common/BuildingFilterSelect";
import moment from "moment";

import { exportQueryDataToExcel } from "../../../utils/exportAPI";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Componente che gestisce la visualizzazione del grafico a barre settimanale per edifici e impianti.
 * Permette di selezionare una settimana, applicare filtri e esportare i dati in formato Excel o PDF.
 *
 * @component
 * @example
 * // Esempio di utilizzo:
 * <WeeklyBarChart setDescription={fn} />
 *
 * @param {Object} props
 * @param {(desc: object) => void} [props.setDescription] - Callback per registrare i metadati del grafico per l’export.
 * @returns {JSX.Element} Componente del grafico settimanale a barre.
 */
const WeeklyBarChart = ({ setDescription }) => {
  // Stato per i dati e per il caricamento
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Stato per i filtri degli edifici e impianti
  const [filters, setFilters] = useState({ buildings: [], impianti: [] });

  const chartRef = useRef(null);

  // Stato per la settimana selezionata (data di inizio della settimana)
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    moment().startOf("week").isoWeekday(1).toDate()
  );

  // Effetto per recuperare i dati quando cambia la settimana o i filtri
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = moment(selectedWeekStart)
          .isoWeekday(1)
          .startOf("day")
          .toDate();

        const endDate = moment(selectedWeekStart)
          .isoWeekday(7)
          .endOf("day")
          .toDate();

        const data = await fetchWeeklyBarChartDataByBuilding(
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

    fetchData();
  }, [selectedWeekStart, filters]);

  /**
   * Registra la "description" per l’export quando il grafico è pronto
   * e ogni volta che cambiano dati/settimana/filtri.
   */
  useEffect(() => {
    if (!setDescription) return;
    if (!chartData) return;

    const id = "panel_weekly_bar";
    const title = "Consumi energetici settimanali (per edificio/impianto)";

    // Un tick per assicurare il paint del DOM
    const tm = setTimeout(() => {
      setDescription({
        type: "chart",
        id,
        title,
        period: {
          start: moment(selectedWeekStart)
            .isoWeekday(1)
            .startOf("day")
            .toISOString(),
          end: moment(selectedWeekStart).isoWeekday(7).endOf("day").toISOString(),
        },
        filters: {
          buildings: filters.buildings,
          impianti: filters.impianti,
        },
        // Nodo radice che contiene il grafico (canvas oppure svg)
        getNode: () => chartRef.current,
      });
    }, 0);

    return () => clearTimeout(tm);
  }, [setDescription, chartData, selectedWeekStart, filters]);

  /**
   * Gestisce il cambiamento della settimana selezionata.
   * @param {Event} e - Evento di cambio settimana.
   */
  const handleWeekChange = (e) => {
    const newDate = moment(e.target.value, "YYYY-[W]WW").isoWeekday(1);
    setSelectedWeekStart(newDate.toDate());
  };

  /**
   * Gestisce il cambiamento dei filtri per edifici e impianti.
   * @param {Object} newFilters - I nuovi filtri selezionati.
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <p>Caricamento dei dati... Attendere per favore.</p>;
  }

  if (!chartData) {
    return <p>Non ci sono dati disponibili per il periodo selezionato.</p>;
  }

  const chartOptions = getChartOptions("Consumo per edificio e sensori");

  /**
   * Funzione per esportare i dati in formato Excel.
   * NB: qui passiamo parametri coerenti con i filtri correnti e il periodo selezionato.
   */
  const handleExportToExcel = async () => {
    try {
      const startDate = moment(selectedWeekStart)
        .isoWeekday(1)
        .startOf("day")
        .toISOString();
      const endDate = moment(selectedWeekStart)
        .isoWeekday(7)
        .endOf("day")
        .toISOString();

      await exportQueryDataToExcel(
        "WeeklyEnergyByBuilding",
        "energyDataService",
        "getWeeklyByBuilding",
        {
          startDate,
          endDate,
          buildings: filters.buildings,
          impianti: filters.impianti,
        }
      );
    } catch (error) {
      console.error("Errore durante l'esportazione Excel:", error);
    }
  };

  /**
   * Funzione per esportare il grafico in formato PDF (locale al componente).
   * Migliorata per CORS/sfondi/qualità.
   */
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
      pdf.text(
        `Consumi settimanali per edificio e impianto`,
        10,
        12,
        { baseline: "top" }
      );
      pdf.setFontSize(11);
      pdf.text(
        `Periodo: ${moment(selectedWeekStart).isoWeekday(1).format("DD MMM YYYY")} - ${moment(
          selectedWeekStart
        )
          .isoWeekday(7)
          .format("DD MMM YYYY")}`,
        10,
        20,
        { baseline: "top" }
      );

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

      // Se non ci sta in altezza, scala di conseguenza
      const maxH = pageHeight - imgY - margin;
      const scale = Math.min(1, maxH / imgHeight);
      const finalW = imgWidth * scale;
      const finalH = imgHeight * scale;

      pdf.addImage(imgData, "PNG", imgX, imgY, finalW, finalH);
      pdf.save(`grafico_consumi_settimanali.pdf`);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between space-x-6">
        {/* Input per selezionare la settimana */}
        <div className="flex-1">
          <input
            type="week"
            value={moment(selectedWeekStart).format("YYYY-[W]WW")}
            onChange={handleWeekChange}
            className="border border-gray-300 rounded p-2"
          />
        </div>

        {/* BuildingFilterSelect per selezionare edifici e impianti */}
        <div className="flex-1">
          <BuildingFilterSelect
            initialSelectedBuildings={filters.buildings}
            initialSelectedImpianti={filters.impianti}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleExportToPDF}
        >
          Esporta in PDF
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={handleExportToExcel}
        >
          Esporta in Excel
        </button>
      </div>

      {/* Visualizzazione del grafico */}
      <div className="result-card p-6 bg-gray-100 rounded-lg">
        <p>
          <strong>Settimana selezionata:</strong>{" "}
          {moment(selectedWeekStart).isoWeekday(1).format("DD MMM YYYY")} -{" "}
          {moment(selectedWeekStart).isoWeekday(7).format("DD MMM YYYY")}
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

      {/* wrapper del grafico: usiamo un DIV per referenziarlo in modo stabile */}
      <div ref={chartRef}>
        <BarChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default WeeklyBarChart;