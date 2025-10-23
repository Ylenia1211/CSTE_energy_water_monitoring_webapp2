import React, { useState, useEffect, useMemo } from "react";
import { fetchWaterConsumptionByBuilding } from "../../utils/consumiIdriciAPI";
import { exportToExcel } from "../../utils/exportAPI"; // Assicurati di avere questa utility
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
];

const WaterConsumptionByBuilding = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [quarter, setQuarter] = useState("");

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStartEndDates = () => {
    let startDate, endDate;

    if (month) {
      const m = parseInt(month, 10); // assicura numerico
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 0, 23, 59, 59);
    } else if (quarter) {
      const q = parseInt(quarter, 10);
      const startMonth = (q - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    return { startDate, endDate };
  };

  const loadData = async () => {
    const { startDate, endDate } = getStartEndDates();

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchWaterConsumptionByBuilding(startDate, endDate);
      setData(response.consumptionByBuilding || []);
    } catch (err) {
      console.error("Errore nel fetch dei consumi idrici:", err);
      setError("Errore nel recupero dei dati");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, quarter]);

  const handleExport = () => {
    if (!Array.isArray(data) || data.length === 0) return;

    const rows = data.map((row) => ({
      Edificio: row.building || "N/A",
      "Consumo Totale (m³)": row.consumo?.toFixed(2) || "0.00",
      Unità: row.unit || "m³",
    }));

    exportToExcel(`Consumi_Idrici_Edificio_${year}`, rows);
  };

  // --- Dati per il grafico a torta ---
  const { chartData, total, unit } = useMemo(() => {
    const cd = (data || []).map((row) => ({
      name: row?.building || "N/D",
      value: Number(row?.consumo) || 0,
    }));
    const tot = cd.reduce((acc, cur) => acc + (Number(cur.value) || 0), 0);
    const u = data?.[0]?.unit || "m³"; // presuppone stessa unità per tutti
    return { chartData: cd, total: tot, unit: u };
  }, [data]);

  return (
    <div className="water-consumption">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Filtro Anno */}
        <div>
          <label className="block text-sm">Anno</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="mt-1 p-2 rounded bg-gray-800 text-white"
          >
            {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Filtro Mese */}
        <div>
          <label className="block text-sm">Mese</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setQuarter("");
            }}
            className="mt-1 p-2 rounded bg-gray-800 text-white"
          >
            <option value="">Tutti</option>
            {[
              "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
              "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
            ].map((name, index) => (
              <option key={index} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>

        {/* Filtro Trimestre */}
        <div>
          <label className="block text-sm font-semibold">Trimestre</label>
          <select
            value={quarter}
            onChange={(e) => {
              setQuarter(e.target.value);
              setMonth("");
            }}
            className="mt-1 p-2 rounded bg-gray-800 text-white"
          >
            <option value="">Tutti</option>
            <option value="1">1° Trimestre</option>
            <option value="2">2° Trimestre</option>
            <option value="3">3° Trimestre</option>
            <option value="4">4° Trimestre</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={handleExport}
          disabled={data.length === 0}
          className={`px-4 py-2 rounded ${
            data.length === 0
              ? "bg-indigo-900 cursor-not-allowed text-white"
              : "bg-indigo-900 hover:bg-indigo-400 text-white"
          }`}
        >
          Esporta in Excel
        </button>
      </div>

      {isLoading ? (
        <div className="text-center mt-4">Caricamento dati...</div>
      ) : error ? (
        <div className="text-red-500 mt-4">{error}</div>
      ) : data.length > 0 ? (
        <div className="mt-6 space-y-6">
          {/* Tabella */}
          <div className="overflow-hidden rounded shadow bg-white">
            <table className="w-full table-auto border-collapse text-sm text-left text-gray-800">
              <thead className="bg-blue-200 text-blue-900">
                <tr>
                  <th className="px-4 py-2 border">Edificio</th>
                  <th className="px-4 py-2 border">Totale Consumo</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-100">
                    <td className="px-4 py-2 border">{row.building}</td>
                    <td className="px-4 py-2 border">
                      {row.consumo?.toFixed(2)} {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grafico a torta */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Distribuzione dei consumi idrici per edificio
              </h3>
              <span className="text-sm text-gray-500">
                Totale: <strong>{total.toFixed(2)} {unit}</strong>
              </span>
            </div>
            <div className="h-80 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    isAnimationActive
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                      value={`${total.toFixed(2)} ${unit}`}
                      position="center"
                      className="text-gray-700"
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, payload) => [
                      `${Number(value).toFixed(2)} ${unit}`,
                      payload?.payload?.name || "Consumo",
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4">Nessun dato disponibile per il periodo selezionato.</p>
      )}
    </div>
  );
};

export default WaterConsumptionByBuilding;
