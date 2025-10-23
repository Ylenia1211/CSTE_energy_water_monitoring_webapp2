import React, { useState, useEffect } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorDisplay from "../common/ErrorDisplay";
import { fetchTotalWaterConsumption } from "../../utils/consumiIdriciAPI";
import { exportToExcel } from "../../utils/exportAPI";

const WaterConsumptionOverTime = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");
  const [quarter, setQuarter] = useState("");

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDateRange = () => {
    let startDate, endDate;

    if (quarter) {
      const startMonth = (parseInt(quarter) - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
    } else if (month !== "") {
      const m = parseInt(month);
      startDate = new Date(year, m, 1);
      endDate = new Date(year, m + 1, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    return [startDate, endDate];
  };

  const loadData = async () => {
    const [startDate, endDate] = calculateDateRange();

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTotalWaterConsumption(startDate, endDate);
      setData(response);
    } catch (err) {
      console.error("Errore nel recupero dei consumi idrici:", err);
      setError("Impossibile recuperare i dati. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };
const handleExport = () => {
  if (!data || typeof data.totalConsumption !== "number") return;

  const exportData = [
    {
      "Data Inizio": new Date(data.startDate).toLocaleDateString("it-IT"),
      "Data Fine": new Date(data.endDate).toLocaleDateString("it-IT"),
      "Consumo Totale (m³)": data.totalConsumption,
      "Unità": data.unit,
    },
  ];

  exportToExcel("Consumo-Idrico-Totale", exportData);
};

  useEffect(() => {
    loadData();
  }, [year, month, quarter]);

  return (
    <div className="water-consumption-over-time">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        {/* Filtro Anno */}
        <div>
          <label className="block mb-1 text-sm">Anno:</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 rounded bg-gray-800 text-white"
          >
            {Array.from({ length: 20 }, (_, i) => 2020 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Mese */}
        <div>
          <label className="block mb-1 text-sm">Mese:</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setQuarter(""); // reset trimestre
            }}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="">Tutti</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("it-IT", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Trimestre */}
        <div>
          <label className="block mb-1 text-sm">Trimestre:</label>
          <select
            value={quarter}
            onChange={(e) => {
              setQuarter(e.target.value);
              setMonth(""); // reset mese
            }}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="">Tutti</option>
            <option value="1">1° Trimestre</option>
            <option value="2">2° Trimestre</option>
            <option value="3">3° Trimestre</option>
            <option value="4">4° Trimestre</option>
          </select>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      <div className="results mt-8">
        {error && <ErrorDisplay message={error} />}
        {data ? (
          <div className="result-card p-6 bg-gray-100 rounded-lg text-gray-800">
            <p>
              <strong>Data Inizio:</strong>{" "}
              {new Date(data.startDate).toLocaleDateString("it-IT")}
            </p>
            <p>
              <strong>Data Fine:</strong>{" "}
              {new Date(data.endDate).toLocaleDateString("it-IT")}
            </p>
            <p className="text-xl mt-4">
              Consumo Idrico Totale:{" "}
              {Math.round(data.totalConsumption)} {data.unit}
            </p>

            <button
                onClick={handleExport}
                disabled={!data || !data.totalConsumption}
                className={`mt-6 py-2 px-4 rounded transition ${
                    !data || !data.totalConsumption
                    ? "bg-indigo-900  text-white cursor-not-allowed hover:bg-indigo-400"
                    : "bg-indigo-900 hover:bg-indigo-400 text-white"
                }`}
                title={!data || !data.totalConsumption ? "Nessun dato da esportare" : "Esporta in Excel"}
                >
                Esporta in Excel
                </button>
          </div>
        ) : (
          <p className="mt-4">Nessun dato disponibile per il periodo selezionato.</p>
        )}
      </div>
    </div>
  );
};

export default WaterConsumptionOverTime;