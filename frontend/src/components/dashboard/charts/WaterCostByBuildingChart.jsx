/**
 * @fileoverview
 * Grafico costi idrici per edificio (campo `totale`) con export PDF
 * e modalità confronto (anni/mesi/trimestri) — versione LineChart (JSX).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchWaterCostByBuilding } from "../../../utils/consumiIdriciAPI";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorDisplay from "../../common/ErrorDisplay";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ====== Config ====== */
const COLORS = [
  "#60a5fa", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#14b8a6", "#eab308", "#f97316",
  "#22c55e", "#3b82f6",
];

const fmtEUR = (v) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(v || 0));

/* ====== Helpers ====== */
// Normalizza risposta API in [{ edificio, costo, unit:"€" }]
function normalizeApiCost(result) {
  const arr = Array.isArray(result)
    ? result
    : Array.isArray(result?.costByBuilding)
    ? result.costByBuilding
    : Array.isArray(result?.consumptionByBuilding)
    ? result.consumptionByBuilding
    : [];

  return arr.map((item) => ({
    edificio: item.edificio ?? item.building ?? item.name ?? "N/D",
    costo: Number(
      item.totale ??
      item.costo ??
      item.amount ??
      item.value ??
      0
    ),
    unit: "€",
  }));
}

function rangeFor({ year, month, quarter }) {
  let startDate, endDate;
  if (month) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else if (quarter) {
    const startMonth = (quarter - 1) * 3;
    startDate = new Date(year, startMonth, 1);
    endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }
  return { startDate, endDate };
}

const tooltipFormatter = (value, name) => [fmtEUR(value), name];
const axisTickFormatter = (v) =>
  new Intl.NumberFormat("it-IT", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(v);

/* ====== Component ====== */
const WaterCostByBuildingChart = () => {
  const chartRef = useRef(null);
  const currentYear = new Date().getFullYear();

  // Modalità: 'none' | 'anni' | 'mesi' | 'trimestri'
  const [compareMode, setCompareMode] = useState("none");

  // Periodo singolo
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");     // "" | 1..12
  const [quarter, setQuarter] = useState(""); // "" | 1..4

  // Confronto
  const [selectedYears, setSelectedYears] = useState([currentYear]);
  const [selectedMonths, setSelectedMonths] = useState([1, 2, 3]);
  const [selectedQuarters, setSelectedQuarters] = useState([1, 2]);
  const [baseYearForIntra, setBaseYearForIntra] = useState(currentYear);

  // Dati
  const [data, setData] = useState([]);
  const [seriesLabels, setSeriesLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const periods = useMemo(() => {
    if (compareMode === "anni") {
      return selectedYears
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((y) => ({ label: String(y), ...rangeFor({ year: y }) }));
    }
    if (compareMode === "mesi") {
      return selectedMonths
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((m) => ({
          label: `${String(m).padStart(2, "0")}/${baseYearForIntra}`,
          ...rangeFor({ year: baseYearForIntra, month: m }),
        }));
    }
    if (compareMode === "trimestri") {
      return selectedQuarters
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((q) => ({
          label: `Q${q}/${baseYearForIntra}`,
          ...rangeFor({ year: baseYearForIntra, quarter: q }),
        }));
    }
    const { startDate, endDate } = rangeFor({ year, month, quarter });
    return [{ label: "Periodo", startDate, endDate }];
  }, [
    compareMode,
    selectedYears,
    selectedMonths,
    selectedQuarters,
    baseYearForIntra,
    year,
    month,
    quarter,
  ]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (compareMode === "none") {
        const res = await fetchWaterCostByBuilding(periods[0].startDate, periods[0].endDate);
        setData(normalizeApiCost(res));
        setSeriesLabels([]);
      } else {
        const results = await Promise.all(
          periods.map((p) =>
            fetchWaterCostByBuilding(p.startDate, p.endDate).then(normalizeApiCost)
          )
        );
        // merge per edificio
        const buildingSet = new Set();
        results.forEach((arr) => arr.forEach((r) => buildingSet.add(r.edificio)));
        const merged = Array.from(buildingSet).map((edificio) => {
          const row = { edificio };
          results.forEach((arr, idx) => {
            const label = periods[idx].label;
            const found = arr.find((r) => r.edificio === edificio);
            row[label] = found ? found.costo : 0;
          });
          return row;
        });
        setData(merged);
        setSeriesLabels(periods.map((p) => p.label));
      }
    } catch (e) {
      console.error("Errore fetch costi acqua:", e);
      setError("Errore durante il recupero dei dati");
      setData([]);
      setSeriesLabels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compareMode,
    year,
    month,
    quarter,
    selectedYears,
    selectedMonths,
    selectedQuarters,
    baseYearForIntra,
  ]);

  const handleExportToPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4");
      pdf.setFontSize(14);
      pdf.text(
        compareMode === "none"
          ? "Costi idrici per edificio"
          : `Costi idrici per edificio — Confronto ${compareMode}`,
        10,
        12
      );

      pdf.setFontSize(10);
      if (compareMode === "none") {
        const { startDate, endDate } = periods[0];
        pdf.text(
          `Periodo: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}`,
          10,
          20
        );
        pdf.text(
          `Filtri: Anno ${year}${
            month ? `, Mese ${String(month).padStart(2, "0")}` : ""
          }${quarter ? `, Trimestre ${quarter}` : ""}`,
          10,
          26
        );
      } else {
        pdf.text(`Serie: ${seriesLabels.join(" | ")}`, 10, 20);
        if (compareMode === "mesi" || compareMode === "trimestri") {
          pdf.text(`Anno base: ${baseYearForIntra}`, 10, 26);
        }
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgMaxWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height / canvas.width) * imgMaxWidth;

      pdf.addImage(imgData, "PNG", margin, 34, imgMaxWidth, imgHeight);

      let y = 40 + imgHeight;
      if (y + 10 < pageHeight - 10) {
        pdf.setFontSize(10);
        if (compareMode === "none") {
          pdf.text("Dati (edificio — costo):", margin, y);
          y += 6;
          for (const d of data) {
            if (y > pageHeight - 10) {
              pdf.addPage();
              y = 10;
            }
            pdf.text(`${d.edificio} — ${fmtEUR(d.costo)}`, margin, y);
            y += 6;
          }
        } else {
          pdf.text("Dati confronto:", margin, y);
          y += 6;
          for (const d of data) {
            if (y > pageHeight - 10) {
              pdf.addPage();
              y = 10;
            }
            const line =
              `${d.edificio} — ` +
              seriesLabels
                .map((s) => `${s}: ${fmtEUR(d[s] || 0)}`)
                .join(" | ");
            pdf.text(line, margin, y);
            y += 6;
          }
        }
      }

      const fileSuffix =
        compareMode === "anni"
          ? `_CONFRONTO_ANNI_${seriesLabels.join("-")}`
          : compareMode === "mesi"
          ? `_CONFRONTO_MESI_${seriesLabels.join("-").replace(/\//g, "")}`
          : compareMode === "trimestri"
          ? `_CONFRONTO_TRIM_${seriesLabels.join("-").replace(/\//g, "")}`
          : month
          ? `_Y${year}_M${String(month).padStart(2, "0")}`
          : quarter
          ? `_Y${year}_Q${quarter}`
          : `_Y${year}`;

      pdf.save(`Costi_Acqua_Edificio${fileSuffix}.pdf`);
    } catch (error) {
      console.error("Errore durante l'esportazione PDF:", error?.message || error);
    }
  };

  /* ====== UI helpers ====== */
  const YearsMultiSelect = () => (
    <select
      multiple
      value={selectedYears}
      onChange={(e) =>
        setSelectedYears(
          Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10))
        )
      }
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[140px] h-28"
    >
      {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );

  const MonthsMultiSelect = () => (
    <select
      multiple
      value={selectedMonths}
      onChange={(e) =>
        setSelectedMonths(
          Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10))
        )
      }
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[160px] h-28"
    >
      {[
        "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
        "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
      ].map((m, i) => (
        <option key={i + 1} value={i + 1}>{`${String(i + 1).padStart(2, "0")} - ${m}`}</option>
      ))}
    </select>
  );

  const QuartersMultiSelect = () => (
    <select
      multiple
      value={selectedQuarters}
      onChange={(e) =>
        setSelectedQuarters(
          Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10))
        )
      }
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[140px] h-28"
    >
      {[1, 2, 3, 4].map((q) => (
        <option key={q} value={q}>{`Q${q}`}</option>
      ))}
    </select>
  );

  /* ====== Render ====== */
  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      {/* Controlli */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-semibold">Modalità</label>
          <select
            value={compareMode}
            onChange={(e) => {
              const mode = e.target.value;
              setCompareMode(mode);
              if (mode === "none") {
                setSelectedYears([currentYear]);
                setSelectedMonths([1, 2, 3]);
                setSelectedQuarters([1, 2]);
              }
            }}
            className="mt-1 p-2 rounded bg-gray-700 text-white"
          >
            <option value="none">Periodo singolo</option>
            <option value="anni">Confronto Anni</option>
            <option value="mesi">Confronto Mesi (stesso anno)</option>
            <option value="trimestri">Confronto Trimestri (stesso anno)</option>
          </select>
        </div>

        {/* Filtri singolo periodo */}
        {compareMode === "none" && (
          <>
            <div>
              <label className="block text-sm font-semibold">Anno</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="mt-1 p-2 rounded bg-gray-700 text-white"
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">Mese</label>
              <select
                value={month}
                onChange={(e) => {
                  const v = e.target.value;
                  setMonth(v ? parseInt(v, 10) : "");
                  setQuarter("");
                }}
                className="mt-1 p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Tutti</option>
                {[
                  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
                ].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">Trimestre</label>
              <select
                value={quarter}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuarter(v ? parseInt(v, 10) : "");
                  setMonth("");
                }}
                className="mt-1 p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Tutti</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>{`Q${q}`}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Confronto anni */}
        {compareMode === "anni" && (
          <div>
            <label className="block text-sm font-semibold">Anni (multi)</label>
            <YearsMultiSelect />
          </div>
        )}

        {/* Confronto mesi */}
        {compareMode === "mesi" && (
          <>
            <div>
              <label className="block text-sm font-semibold">Anno base</label>
              <select
                value={baseYearForIntra}
                onChange={(e) => setBaseYearForIntra(parseInt(e.target.value, 10))}
                className="mt-1 p-2 rounded bg-gray-700 text-white"
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">Mesi (multi)</label>
              <MonthsMultiSelect />
            </div>
          </>
        )}

        {/* Confronto trimestri */}
        {compareMode === "trimestri" && (
          <>
            <div>
              <label className="block text-sm font-semibold">Anno base</label>
              <select
                value={baseYearForIntra}
                onChange={(e) => setBaseYearForIntra(parseInt(e.target.value, 10))}
                className="mt-1 p-2 rounded bg-gray-700 text-white"
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">Trimestri (multi)</label>
              <QuartersMultiSelect />
            </div>
          </>
        )}
      </div>

      {/* Export */}
      {data.length > 0 && (
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-60"
            onClick={handleExportToPDF}
            disabled={loading}
          >
            Esporta in PDF
          </button>
        </div>
      )}

      {/* Stato / Grafico */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : data.length === 0 ? (
        <p className="text-gray-400">Nessun dato disponibile per i filtri selezionati.</p>
      ) : (
        <div ref={chartRef} className="bg-white p-4 rounded">
          <ResponsiveContainer width="100%" height={360}>
            <ReLineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="edificio" stroke="#333" />
              <YAxis stroke="#333" tickFormatter={axisTickFormatter} />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ backgroundColor: "#f9f9f9", color: "#000" }} />
              <Legend />
              {compareMode === "none" ? (
                <Line
                  type="monotone"
                  dataKey="costo"
                  name="Costo"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                seriesLabels.map((label, idx) => (
                  <Line
                    key={label}
                    type="monotone"
                    dataKey={label}
                    name={label}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))
              )}
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WaterCostByBuildingChart;