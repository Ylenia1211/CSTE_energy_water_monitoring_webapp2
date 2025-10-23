/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `TimeSeriesDataComponent`, che visualizza un grafico a
 * linee (time series) per un dato campo (come il consumo energetico) in base a edifici e impianti.
 * Il componente consente di selezionare un intervallo di tempo, applicare filtri per edifici e impianti,
 * e recuperare i dati tramite un'API. Supporta l'esportazione dei dati in formato Excel e PDF.
 *
 * @module TimeSeriesDataComponent
 */

import React, { useState, useEffect, useRef } from "react";
import {
  TimeSeriesChart,
  generateTimeSeriesData,
} from "./base_chart/TimeSeriesChart";
import { fetchNestedFieldData } from "../../../utils/consumiAPI";
import { exportQueryDataToExcel } from "../../../utils/exportAPI";
import useTimeRange from "../../../hooks/useTimeRange";
import TimeRangePicker from "../../common/TimeRangePicker";
import { useFilters } from "../../../context/filterContext"; // Importa l'hook per accedere ai filtri
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Componente React per visualizzare un grafico a linee (time series) in base ai dati di consumo
 * di un campo specifico (come consumo energetico). Il componente permette di selezionare un intervallo
 * di tempo, applicare filtri per edifici e impianti, e supporta l'esportazione dei dati in formato Excel e PDF.
 *
 * @component
 * @example
 * const example = (
 *   <TimeSeriesDataComponent
 *     fieldName="Voltaggio"
 *     unit="V"
 *     title="Voltaggio"
 *   />
 * )
 *
 * @param {string} fieldName - Il nome del campo per cui si vogliono visualizzare i dati (es. "energy_consumption").
 * @param {string} unit - L'unità di misura del campo (es. "kWh").
 * @param {string} title - Il titolo da visualizzare per il grafico.
 *
 * @returns {JSX.Element} Il componente che visualizza il grafico e permette l'esportazione dei dati.
 */
const TimeSeriesDataComponent = ({ fieldName, unit, title }) => {
  const { startDate, endDate, activeRange, handleSelectRange } =
    useTimeRange("week"); // Usa l'hook
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { filters } = useFilters();

  const chartRef = useRef();

  /**
   * Recupera i dal campo specificato, intervallo di tempo e filtri applicati.
   * Trasforma i dati ricevuti in un formato utiti di consumo dal server per ilizzabile dal grafico.
   *
   * @async
   * @function
   * @returns {void}
   */
  const fetchConsumptionData = async () => {
    if (!startDate || !endDate) return; // Evita il fetch se le date non sono impostate

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

      // Trasforma i dati per il grafico
      const transformedData = generateTimeSeriesData(rawData, fieldName);

      console.log({ rawData, transformedData });

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
   * Effettua il recupero dei dati ogni volta che cambiano le date o i filtri.
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

  const testColumnsConfig = [
    { header: "Datetime", key: "datetime", width: 20 },
    { header: "Building", key: "building", width: 15 },
    { header: "A", key: "A", width: 15 },
  ];

  /**
   * Esporta i dati in formato Excel utilizzando un'API specifica per l'esportazione dei dati.
   *
   * @async
   * @function
   * @returns {void}
   */
  const handleExportToExcel = async () => {
    try {
      // Ottieni tutti i dati senza paginazione per l'esportazione
      // const data = await getLogs({ ...filters }); // Passa il parametro `noPagination` come true per avere tutti i dati
      // console.log("Dati da esportare:", data);
      await exportQueryDataToExcel(
        "BuildingEnergyConsumption",
        "energyDataService",
        "getNestedFields",
        {
          fieldName,
          startDate,
          endDate,
          buildings: filters.buildings,
          impianti: filters.impianti,
        }
      );
    } catch (error) {
      console.error("Errore durante l'esportazione:", error.message);
      toast.error("Errore durante l'esportazione.");
    }
  };

  /**
   * Esporta il grafico in formato PDF. Utilizza html2canvas per convertire il grafico in un'immagine
   * e jsPDF per creare il PDF.
   *
   * @function
   * @returns {void}
   */
  const handleExportToPDF = () => {
    if (chartRef.current) {
      const chartElement =
        chartRef.current.querySelector("canvas") || chartRef.current;

      html2canvas(chartElement).then((canvas) => {
        const pdf = new jsPDF("l", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");

        // Imposta la dimensione del titolo e aggiungilo
        pdf.setFontSize(20);
        pdf.text(`Grafico ${title}`, 10, 10); // Posizione (x, y)
        pdf.setFontSize(18);
        pdf.text(
          `Periodo: ${new Date(startDate).toLocaleString()} - ${new Date(
            endDate
          ).toLocaleString()}`,
          10,
          20
        ); // Posizione (x, y)
        pdf.text(
          `Filtri applicati: ${filters.buildings.join(
            ", "
          )}, ${filters.impianti.join(", ")}`,
          10,
          30
        ); // Posizione (x, y)
        console.log(filters);

        // Calcola le dimensioni dell'immagine per adattarla meglio
        const imgWidth = 287; // Larghezza dell'immagine in mm
        const imgHeight = (canvas.height / canvas.width) * imgWidth; // Mantiene le proporzioni
        const imgX = 10; // Posizione orizzontale
        const imgY = 40; // Posizione verticale, subito sotto il titolo

        // Aggiungi l'immagine del grafico con le dimensioni calcolate
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

        // Salva il PDF con il nome specificato
        pdf.save(`grafico-${title}.pdf`);
      });
    } else {
      console.error("Il contenitore del grafico non è stato trovato.");
    }
  };

  return (
    <div className="time-series-data">
      <TimeRangePicker
        defaultRange={activeRange}
        onSelectRange={handleSelectRange} // Passa la logica al TimeRangePicker
        isLoading={isLoading} // Indica lo stato di caricamento
        showRealtimeCheckbox={true}
      />

      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
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

      {isLoading && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-6 h-6"></div>
        </div>
      )}

      <div className="results mt-8" ref={chartRef}>
        {error && <p className="text-red-500">{error}</p>}
        {labels.length > 0 && datasets.length > 0 ? (
          <TimeSeriesChart
            labels={labels}
            datasets={datasets}
            title={title}
            unit={unit}
          />
        ) : (
          !isLoading && <p>Nessun dato disponibile.</p>
        )}
      </div>
    </div>
  );
};

export default TimeSeriesDataComponent;
