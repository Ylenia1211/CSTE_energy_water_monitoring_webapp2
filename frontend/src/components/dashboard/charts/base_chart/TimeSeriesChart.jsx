/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente `TimeSeriesChart`, che visualizza un grafico a linee interattivo per una serie temporale, utilizzando `chart.js`.
 * Il componente permette di eseguire operazioni di zoom e pan sul grafico tramite una serie di azioni configurabili.
 * Le funzionalità di zoom e pan sono gestite tramite il plugin `chartjs-plugin-zoom`, e le azioni includono ingrandire, ridurre, pan e reset del zoom.
 *
 * @module TimeSeriesChart
 */

import React, { useEffect, useRef, useState, memo } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-moment";
import zoomPlugin from "chartjs-plugin-zoom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faSearchMinus,
  faHandPaper,
  faUndoAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

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
  Filler,
  zoomPlugin
);

/**
 * Funzione che genera un colore casuale per le linee del grafico.
 *
 * @returns {string} Un colore esadecimale casuale (es. "#FF5733").
 */
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Funzione che genera i dati di una serie temporale per il grafico.
 *
 * @param {Array<Object>} data - I dati grezzi da cui estrarre le informazioni per il grafico.
 * @param {string} fieldName - Il nome del campo che contiene i valori da visualizzare nel grafico.
 *
 * @returns {Object} Un oggetto che contiene le etichette (labels) e i dataset formattati per `chart.js`.
 */
export const generateTimeSeriesData = (data, fieldName) => {
  const labels = [];
  const datasets = [];
  const datasetMap = {};

  data.forEach((item) => {
    const datetime = new Date(item.datetime);
    if (!labels.includes(datetime)) {
      labels.push(datetime);
    }

    const values = item[fieldName];
    if (values) {
      if (typeof values === "object" && !Array.isArray(values)) {
        Object.keys(values).forEach((key) => {
          if (values[key] !== null) {
            const datasetKey = `${item.building}-${item.id}-${key}`;
            if (!datasetMap[datasetKey]) {
              datasetMap[datasetKey] = {
                label: `${item.building} - ${item.id} - ${key}`,
                data: Array(labels.length).fill(null),
                borderColor: getRandomColor(),
                backgroundColor: "rgba(0, 0, 0, 0)",
                fill: false,
              };
            }
            const index = labels.indexOf(datetime);
            datasetMap[datasetKey].data[index] = values[key];
          }
        });
      } else {
        const datasetKey = `${item.building}-${item.id}-${fieldName}`;
        if (!datasetMap[datasetKey]) {
          datasetMap[datasetKey] = {
            label: `${item.building} - ${item.id} - ${fieldName}`,
            data: Array(labels.length).fill(null),
            borderColor: getRandomColor(),
            backgroundColor: "rgba(0, 0, 0, 0)",
            fill: false,
          };
        }
        const index = labels.indexOf(datetime);
        datasetMap[datasetKey].data[index] = values;
      }
    }
  });

  Object.values(datasetMap).forEach((dataset) => datasets.push(dataset));
  const formattedLabels = labels.map((label) => label.toISOString());

  return {
    labels: formattedLabels,
    datasets,
  };
};

/**
 * Componente che visualizza un grafico a linee con funzionalità di zoom e pan.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <TimeSeriesChart
 *   labels={labels}
 *   datasets={datasets}
 *   title="Corrente"
 *   unit="A"
 * />
 *
 * @param {Array<string>} labels - Le etichette (timestamp) per l'asse X del grafico.
 * @param {Array<Object>} datasets - Un array di dataset, ciascuno contenente `label`, `data`, `borderColor` e altre configurazioni per la linea.
 * @param {string} title - Il titolo da visualizzare sull'asse Y.
 * @param {string} unit - L'unità di misura da visualizzare sull'asse Y (opzionale).
 *
 * @returns {JSX.Element} Un grafico a linee interattivo con le funzionalità di zoom e pan.
 */
const TimeSeriesChartComponent = ({
  labels,
  datasets,
  title,
  unit,
  options,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, []);

  const data = {
    labels,
    datasets,
  };

  // Definizione delle azioni di zoom e pan
  const actions = [
    {
      name: "+10%",
      icon: faSearchPlus,
      handler: () => {
        if (chartRef.current) {
          chartRef.current.zoom({ x: 1.1 });
        }
      },
    },
    {
      name: "-10%",
      icon: faSearchMinus,
      handler: () => {
        if (chartRef.current) {
          chartRef.current.zoom({ x: 0.9 });
        }
      },
    },
    {
      name: "+100px",
      icon: faHandPaper,
      handler: () => {
        if (chartRef.current) {
          chartRef.current.pan({ x: 100 });
        }
      },
    },
    {
      name: "-100px",
      icon: faHandPaper,
      handler: () => {
        if (chartRef.current) {
          chartRef.current.pan({ x: -100 });
        }
      },
    },
    {
      name: "Reset zoom",
      icon: faUndoAlt,
      handler: () => {
        if (chartRef && chartRef.current) {
          chartRef.current.resetZoom();
        }
      },
    },
  ];

  const options1 = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: {
      legend: {
        position: "top",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
          speed: 0.5,
          modifierKey: "ctrl",
        },
        zoom: {
          onZoomComplete({ chart }) {
            chart.update("none");
          },
          wheel: {
            enabled: true,
          },
          drag: {
            enabled: true,
          },
          speed: 0.1,
          mode: "xy",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "YYYY-MM-DD HH:mm:ss",
          displayFormats: {
            minute: "YYYY-MM-DD HH:mm:ss",
            hour: "YYYY-MM-DD HH:mm:ss",
          },
        },
        title: {
          display: true,
          text: "Data",
        },
        ticks: {
          font: {
            weight: "bold",
          },
          minRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        title: {
          display: true,
          text: `${title} (${unit || "unità"})`,
        },
        beginAtZero: true,
      },
    },
  };

  const generateUniqueCanvasId = () =>
    `chart-${Math.random().toString(36).substring(2, 15)}`;

  return (
    <>
      {/* Visualizzazione dei pulsanti con icone */}
      <div className="flex flex-row" style={{ marginBottom: "10px" }}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.handler}
            className="flex mr-1 p-1 bg-gray-800 text-white rounded"
            style={{
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              className="text-white p-1"
              icon={action.icon}
              size="lg"
            />
            {action.name}
          </button>
        ))}
        {/* Riquadro informativo */}
        <div className="flex items-center ml-auto p-2 text-white text-bold rounded border bg-blue-400">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" size="lg" />
          <span>CTRL to Pan</span>
        </div>
      </div>
      <Line
        ref={chartRef}
        id={generateUniqueCanvasId()}
        data={data}
        options={options || options1}
      />
    </>
  );
};

// Memoizzazione del componente per evitare il rendering non necessario
export const TimeSeriesChart = memo(TimeSeriesChartComponent);
