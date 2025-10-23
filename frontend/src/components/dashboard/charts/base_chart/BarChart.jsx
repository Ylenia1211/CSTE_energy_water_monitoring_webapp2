/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente `BarChart` che visualizza un grafico a barre utilizzando la libreria `chart.js`.
 * Il componente riceve i dati e le opzioni come props e rende il grafico a barre dinamicamente.
 * Contiene anche due funzioni ausiliarie per generare i dati del grafico (`generateChartData`) e configurare le opzioni del grafico (`getChartOptions`).
 *
 * @module BarChart
 */

import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

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

// Registrazione dei componenti di Chart.js
ChartJS.register(
  LineElement,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

/**
 * Componente `BarChart` che visualizza un grafico a barre.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <BarChart
 *   data={chartData}
 *   options={chartOptions}
 * />
 *
 * @param {Object} data - I dati da visualizzare nel grafico. Deve includere un array `labels` e un array `datasets`.
 * @param {Object} options - Le opzioni di configurazione del grafico, come titoli, dimensioni e colori.
 *
 * @returns {JSX.Element} Un grafico a barre generato dinamicamente in base ai dati e alle opzioni fornite.
 */
export const BarChart = ({ data, options }) => {
  if (!data || !data.datasets) {
    return <p>Nessun dato disponibile</p>; // Messaggio predefinito
  }

  return <Bar className="w-screen" data={data} options={options} />;
};

/**
 * Funzione che genera i dati del grafico a barre.
 * La funzione prende un array di etichette (`labels`) e una configurazione di dataset (`datasetConfig`) e restituisce l'oggetto dei dati compatibile con Chart.js.
 *
 * @param {Array<string>} labels - Un array di etichette per l'asse X del grafico.
 * @param {Array<Object>} datasetConfig - Una configurazione dei dataset per il grafico, ciascuno contenente un `label` e `data`.
 *
 * @returns {Object} I dati formattati per il grafico a barre, contenenti `labels` e `datasets`.
 */
export const generateChartData = (labels, datasetConfig) => {
  if (!Array.isArray(labels) || !Array.isArray(datasetConfig)) {
    console.error("Labels o dataset non validi!");
    return { labels: [], datasets: [] };
  }

  return {
    labels,
    datasets: datasetConfig.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || "rgba(0,0,0,0.1)", // Default
    })),
  };
};

/**
 * Funzione che restituisce le opzioni di configurazione per il grafico a barre.
 * Le opzioni comprendono titoli per gli assi, la posizione della legenda e la gestione dei valori sull'asse Y.
 *
 * @param {string} title - Il titolo del grafico.
 *
 * @returns {Object} Le opzioni di configurazione del grafico a barre.
 */
export const getChartOptions = (title) => ({
  responsive: true,
  // maintainAspectRatio: false, // Imposta la larghezza a piacere
  plugins: {
    legend: {
      position: "right",
    },
  },
  scales: {
    x: {
      // Imposta il titolo dell'asse X
      title: {
        display: true,
        text: "Edifici",
      },
      barPercentage: 1,
    },
    y: {
      // Imposta il titolo dell'asse Y
      title: {
        display: true,
        text: title || "Consumi (kWh)",
      },
      // Inizia l'asse Y da zero
      beginAtZero: true,
      // Gestione automatica dei valori dell'asse Y
      ticks: {
        stepSize: 500,
        callback: function (value) {
          return value + " kWh"; // Aggiungi unità di misura kWh
        },
      },
    },
  },
  font: {
    size: 16,
  },
  datasets: {
    categoryPercentage: 0.5, // Imposta la larghezza della categoria
    barPercentage: 1, // Imposta la larghezza della barra
  },
});
