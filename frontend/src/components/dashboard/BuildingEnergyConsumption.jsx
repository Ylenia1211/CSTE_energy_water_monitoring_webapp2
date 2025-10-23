/**
 * @fileoverview
 * @namespace components
 * Componente React `BuildingEnergyConsumption` per visualizzare
 * il consumo energetico totale e per edificio in un intervallo di tempo,
 * con esportazione in Excel e due line chart: totale e per edificio.
 */

import React, { useState, useEffect, useMemo } from "react";
import TimeRangePicker from "../common/TimeRangePicker";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorDisplay from "../common/ErrorDisplay";
import ResultCard from "../common/ResultCard";
import { fetchTotalConsumptionByBuilding } from "../../utils/consumiAPI";
import { exportQueryDataToExcel } from "../../utils/exportAPI";
import useTimeRange from "../../hooks/useTimeRange";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Palette colori per linee per edificio
const SERIES_COLORS = [
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

const BuildingEnergyConsumption = () => {
  const { startDate, endDate, activeRange, handleSelectRange } = useTimeRange("week");

  const [consumptionData, setConsumptionData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dati
  const fetchConsumptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTotalConsumptionByBuilding(startDate, endDate);
      setConsumptionData(data);
    } catch (err) {
      console.error("Errore durante il recupero dei dati:", err?.message || err);
      setError("Impossibile recuperare i consumi. Verifica le date.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchConsumptionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Helper massimo/minimo costo
  const getMaxCostBuilding = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.reduce((max, cur) => (cur.consumption * 0.12 > max.consumption * 0.12 ? cur : max));
  };
  const getMinCostBuilding = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.reduce((min, cur) => (cur.consumption * 0.12 < min.consumption * 0.12 ? cur : min));
  };

  const maxCostBuilding = consumptionData ? getMaxCostBuilding(consumptionData.consumptionByBuilding) : null;
  const minCostBuilding = consumptionData ? getMinCostBuilding(consumptionData.consumptionByBuilding) : null;

  const handleExportToExcel = async () => {
    try {
      await exportQueryDataToExcel(
        "BuildingEnergyConsumption",
        "energyDataService",
        "getTotalConsumptionByBuilding",
        { startDate, endDate }
      );
    } catch (err) {
      console.error("Errore durante l'esportazione:", err?.message || err);
    }
  };

  // --- Line chart del TOTALE ---
  const { trendData, unitForTrend, isSyntheticTrend } = useMemo(() => {
    if (!consumptionData)
      return { trendData: null, unitForTrend: "kWh", isSyntheticTrend: false };

    const arrCandidate = [
      consumptionData?.totalOverTime,
      consumptionData?.overTime,
      consumptionData?.timeSeries,
      consumptionData?.consumptionOverTime,
    ].find(Array.isArray);

    const fallbackUnit =
      consumptionData?.unit ||
      arrCandidate?.[0]?.unit ||
      (consumptionData?.consumptionByBuilding?.[0]?.unit ?? "kWh");

    if (Array.isArray(arrCandidate)) {
      const parsed = arrCandidate
        .map((p) => {
          const d = p.date || p.timestamp || p.t || p.time || p.day;
          const v = p.total ?? p.value ?? p.consumption ?? p.amount ?? p.reading ?? null;
          if (!d || v == null) return null;
          const iso = new Date(d);
          if (isNaN(iso.getTime())) return null;
          return { date: iso, dateLabel: iso.toISOString(), total: Number(v), unit: fallbackUnit };
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);
      return { trendData: parsed, unitForTrend: fallbackUnit, isSyntheticTrend: false };
    }

    if (consumptionData?.seriesByDay && typeof consumptionData.seriesByDay === "object") {
      const parsed = Object.entries(consumptionData.seriesByDay)
        .map(([d, v]) => {
          const iso = new Date(d);
          if (isNaN(iso.getTime())) return null;
          return { date: iso, dateLabel: iso.toISOString(), total: Number(v), unit: fallbackUnit };
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);
      return { trendData: parsed, unitForTrend: fallbackUnit, isSyntheticTrend: false };
    }

    // Fallback sintetico cumulativo (lineare)
    const start = consumptionData?.startDate ? new Date(consumptionData.startDate) : null;
    const end = consumptionData?.endDate ? new Date(consumptionData.endDate) : null;

    const total =
      typeof consumptionData?.total === "number"
        ? consumptionData.total
        : Array.isArray(consumptionData?.consumptionByBuilding)
        ? consumptionData.consumptionByBuilding.reduce((acc, b) => acc + (Number(b.consumption) || 0), 0)
        : null;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()) || total == null) {
      return { trendData: null, unitForTrend: fallbackUnit, isSyntheticTrend: false };
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const days = Math.max(2, Math.floor((end - start) / oneDay) + 1);
    const perDay = total / (days - 1);

    const synthetic = Array.from({ length: days }, (_, i) => {
      const d = new Date(start.getTime() + i * oneDay);
      return { date: d, dateLabel: d.toISOString(), total: Number((perDay * i).toFixed(6)), unit: fallbackUnit };
    });

    return { trendData: synthetic, unitForTrend: fallbackUnit, isSyntheticTrend: true };
  }, [consumptionData]);

  // --- Line chart PER EDIFICIO ---
  const { buildingTrend, buildingLines } = useMemo(() => {
    if (!consumptionData) return { buildingTrend: null, buildingLines: [] };

    const names = Array.isArray(consumptionData?.consumptionByBuilding)
      ? consumptionData.consumptionByBuilding.map((b) => b.building).filter(Boolean)
      : [];

    // timeline di riferimento
    const makeDailyTimeline = (start, end) => {
      const oneDay = 24 * 60 * 60 * 1000;
      const days = Math.max(2, Math.floor((end - start) / oneDay) + 1);
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(start.getTime() + i * oneDay);
        return { date: d, dateLabel: d.toISOString() };
      });
    };

    let timeline = null;
    if (Array.isArray(trendData) && trendData.length > 0) {
      timeline = trendData.map((p) => ({ date: p.date, dateLabel: p.dateLabel }));
    } else {
      const s = consumptionData?.startDate ? new Date(consumptionData.startDate) : null;
      const e = consumptionData?.endDate ? new Date(consumptionData.endDate) : null;
      if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime()))
        return { buildingTrend: null, buildingLines: [] };
      timeline = makeDailyTimeline(s, e);
    }

    const keyFromName = (name) => name.replace(/[^a-zA-Z0-9_]/g, "_");
    const lines = names.map((n, i) => ({ name: n, key: keyFromName(n), color: SERIES_COLORS[i % SERIES_COLORS.length] }));

    // Serie esplicita per edificio (se presente)
    let explicit = null;
    if (Array.isArray(consumptionData?.byBuildingOverTime)) {
      explicit = consumptionData.byBuildingOverTime
        .map((p) => {
          const d = new Date(p.date || p.timestamp || p.t || p.day || p.time);
          if (isNaN(d.getTime())) return null;
          const row = { date: d, dateLabel: d.toISOString() };
          lines.forEach(({ key, name }) => {
            const v = p.series?.[name];
            if (v != null) row[key] = Number(v);
          });
          return row;
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);
    }

    const result = explicit && explicit.length ? explicit : timeline.map((t) => ({ ...t }));

    // Fallback cumulativo lineare per edificio
    if (!(explicit && explicit.length)) {
      const totals = new Map();
      (consumptionData?.consumptionByBuilding || []).forEach((b) => {
        totals.set(b.building, Number(b.consumption) || 0);
      });

      const steps = Math.max(1, result.length - 1);
      lines.forEach(({ name, key }) => {
        const tot = totals.get(name) || 0;
        const perStep = steps > 0 ? tot / steps : 0;
        result.forEach((row, idx) => {
          row[key] = Number((perStep * idx).toFixed(6));
        });
      });
    }

    return { buildingTrend: result, buildingLines: lines };
  }, [consumptionData, trendData]);

  return (
    <div className="energy-consumption">
      <TimeRangePicker
        onSelectRange={handleSelectRange}
        isLoading={isLoading}
        defaultRange={activeRange}
      />

      <button
        className="mt-4 px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-400"
        onClick={handleExportToExcel}
      >
        Esporta in Excel
      </button>

      {isLoading && <LoadingSpinner />}

      <div className="results mt-8">
        {error && <ErrorDisplay message={error} />}
        {consumptionData ? (
          <div className="result-card p-6 bg-gray-100 rounded-lg">
            <p>
              <strong>Data Inizio:</strong>{" "}
              {new Date(consumptionData.startDate).toLocaleString()}
            </p>
            <p>
              <strong>Data Fine:</strong>{" "}
              {new Date(consumptionData.endDate).toLocaleString()}
            </p>

            <div className="mt-4">
              <strong>Consumi per Edificio:</strong>
              <div className="building-consumptions mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.isArray(consumptionData?.consumptionByBuilding) ? (
                  consumptionData.consumptionByBuilding.map((b, index) => {
                    const cost = (b.consumption * 0.12).toFixed(2);
                    const isHighest = maxCostBuilding && b === maxCostBuilding;
                    const isLowest = minCostBuilding && b === minCostBuilding;
                    return (
                      <ResultCard
                        key={index}
                        building={b.building}
                        consumption={b.consumption.toFixed(2)}
                        unit={b.unit}
                        cost={cost}
                        isHighestCost={isHighest}
                        isLowestCost={isLowest}
                      />
                    );
                  })
                ) : (
                  <p>Consumi per edificio non disponibili.</p>
                )}
              </div>
            </div>

            {/* Line Chart: Totale */}
            <div className="mt-8 bg-white rounded shadow p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-800">Andamento del consumo totale</h3>
                {trendData?.length ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Punti: <strong>{trendData.length}</strong> · Unità: <strong>{unitForTrend}</strong>
                    </span>
                    {isSyntheticTrend && (
                      <span
                        className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded"
                        title={"Serie generata linearmente dal totale nel periodo"}
                      >
                        stima lineare
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {trendData && trendData.length > 0 ? (
                <div className="h-80 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(v) => new Date(v).toLocaleString()}
                        formatter={(value) => [`${Number(value).toFixed(2)} ${unitForTrend}`, "Totale"]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Totale consumo" strokeWidth={2} dot={false} isAnimationActive />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Trend non disponibile per il periodo selezionato oppure non restituito dal servizio.</p>
              )}
            </div>

            {/* Line Chart: Per edificio */}
            <div className="mt-6 bg-white rounded shadow p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-800">Andamento per edificio (cumulativo)</h3>
                {buildingTrend?.length ? (
                  <span className="text-sm text-gray-500">Punti: <strong>{buildingTrend.length}</strong></span>
                ) : null}
              </div>

              {buildingTrend && buildingTrend.length > 0 ? (
                <div className="h-96 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={buildingTrend} margin={{ top: 10, right: 24, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
                      <Legend />
                      {buildingLines.map((l) => (
                        <Line
                          key={l.key}
                          type="monotone"
                          dataKey={l.key}
                          name={l.name}
                          stroke={l.color}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Serie per edificio non disponibile o non determinabile dal dato fornito.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Nessun dato disponibile.</p>
        )}
      </div>
    </div>
  );
};

export default BuildingEnergyConsumption;
