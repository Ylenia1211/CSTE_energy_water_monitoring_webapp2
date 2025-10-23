/**
 * @fileoverview
 * Grafico consumi idrici per edificio con export PDF e modalità confronto (anni/mesi/trimestri).
 */
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchWaterConsumptionByBuilding2 } from "../../../utils/consumiIdriciAPI";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorDisplay from "../../common/ErrorDisplay";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Palette base per serie multiple
const COLORS = [
  "#60a5fa", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#14b8a6", "#eab308", "#f97316",
  "#22c55e", "#3b82f6",
];

/** Utility: normalizza la risposta API in [{edificio, consumo, unit}] */
function normalizeApi(result) {
  const arr = Array.isArray(result)
    ? result
    : Array.isArray(result?.consumptionByBuilding)
    ? result.consumptionByBuilding
    : [];
  return arr.map((item) => ({
    edificio: item.edificio ?? item.building ?? item.name ?? "N/D",
    consumo: Number(item.consumo ?? item.consumption ?? item.value ?? 0),
    unit: item.unit ?? "m³",
  }));
}

/** Utility: costruisce un intervallo start/end per mese/quart/quando serve */
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

/** Tooltip formatter per Recharts */
const tooltipFormatter = (value, name) => [`${value} m³`, name];

const WaterConsumptionByBuildingChart = ({ setDescription }) => {
  const chartRef = useRef(null);

  const currentYear = new Date().getFullYear();


  // Modalità confronto: 'none' | 'anni' | 'mesi' | 'trimestri'
  const [compareMode, setCompareMode] = useState("none");

  // Selezioni base (modalità singola)
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");      // "" oppure number (1..12)
  const [quarter, setQuarter] = useState("");  // "" oppure number (1..4)

  // Selezioni confronto
  const [selectedYears, setSelectedYears] = useState([currentYear]);   // per 'anni'
  const [selectedMonths, setSelectedMonths] = useState([1, 2, 3]);     // per 'mesi' (dello stesso anno base)
  const [selectedQuarters, setSelectedQuarters] = useState([1, 2]);    // per 'trimestri' (dello stesso anno base)
  const [baseYearForIntra, setBaseYearForIntra] = useState(currentYear); // anno base per mesi/trimestri

  const [data, setData] = useState([]);  // per 'none': [{edificio, consumo}], per confronto: [{edificio, Serie1, Serie2, ...}]
  const [seriesLabels, setSeriesLabels] = useState([]); // nomi serie (anni/mesi/trimestri) in modalità confronto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastDescKeyRef = useRef("");


  /* Costruisce i "periodi" da confrontare in base alla modalità */
  const periods = useMemo(() => {
    if (compareMode === "anni") {
      // Serie: ogni anno selezionato
      return selectedYears
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((y) => ({ label: String(y), ...rangeFor({ year: y }) }));
    } else if (compareMode === "mesi") {
      // Serie: mesi dell'anno base
      return selectedMonths
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((m) => ({
          label: `${String(m).padStart(2, "0")}/${baseYearForIntra}`,
          ...rangeFor({ year: baseYearForIntra, month: m }),
        }));
    } else if (compareMode === "trimestri") {
      // Serie: trimestri dell'anno base
      return selectedQuarters
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map((q) => ({
          label: `Q${q}/${baseYearForIntra}`,
          ...rangeFor({ year: baseYearForIntra, quarter: q }),
        }));
    }
    // Modalità singola
    const { startDate, endDate } = rangeFor({ year, month, quarter });
    return [{ label: "Periodo", startDate, endDate }];
  }, [compareMode, selectedYears, selectedMonths, selectedQuarters, baseYearForIntra, year, month, quarter]);

  // Caricamento dati (singolo o multiplo)
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (compareMode === "none") {
        const res = await fetchWaterConsumptionByBuilding2(periods[0].startDate, periods[0].endDate);
        const norm = normalizeApi(res);
        setData(norm);
        setSeriesLabels([]); // una sola serie 'consumo'
      } else {
        // Fetch in parallelo per ogni periodo
        const results = await Promise.all(
          periods.map((p) =>
            fetchWaterConsumptionByBuilding2(p.startDate, p.endDate).then(normalizeApi)
          )
        );
        // Merge per edificio: { edificio, [label1]: val, [label2]: val, ... }
        const buildingSet = new Set();
        results.forEach(arr => arr.forEach(r => buildingSet.add(r.edificio)));

        const merged = Array.from(buildingSet).map((edificio) => {
          const row = { edificio };
          results.forEach((arr, idx) => {
            const label = periods[idx].label;
            const found = arr.find((r) => r.edificio === edificio);
            row[label] = found ? found.consumo : 0;
          });
          return row;
        });

        setData(merged);
        setSeriesLabels(periods.map((p) => p.label));
      }
    } catch (err) {
      console.error("Errore fetch:", err);
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
  }, [compareMode, year, month, quarter, selectedYears, selectedMonths, selectedQuarters, baseYearForIntra]);
  
  
  

  // === Description per export (safe, non blocca il render) ===
/*useEffect(() => {
  if (!setDescription) return;
  if (!chartRef.current) return;
  if (!data || data.length === 0) return;

  const id = "water_by_building";
  const title = "Consumo idrico per edificio (anno/mese/trimestre)";

  // Costruiamo i periodi senza dipendere da oggetti instabili
  let payloadCore;
  if (compareMode === "none") {
    const { startDate, endDate } = rangeFor({ year, month, quarter });
    payloadCore = {
      type: "chart",
      id,
      title,
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      filters: { mode: compareMode, year, month, quarter },
    };
  } else {
    const list =
      compareMode === "anni"
        ? [...selectedYears].sort((a,b)=>a-b).map((y)=>({ label: String(y), ...rangeFor({ year: y }) }))
        : compareMode === "mesi"
        ? [...selectedMonths].sort((a,b)=>a-b).map((m)=>({ label: `${String(m).padStart(2,"0")}/${baseYearForIntra}`, ...rangeFor({ year: baseYearForIntra, month: m }) }))
        : [...selectedQuarters].sort((a,b)=>a-b).map((q)=>({ label: `Q${q}/${baseYearForIntra}`, ...rangeFor({ year: baseYearForIntra, quarter: q }) }));

    payloadCore = {
      type: "chart",
      id,
      title,
      periods: list.map(p => ({
        label: p.label,
        start: p.startDate.toISOString(),
        end: p.endDate.toISOString(),
      })),
      filters: {
        mode: compareMode,
        baseYear: baseYearForIntra,
        years: selectedYears,
        months: selectedMonths,
        quarters: selectedQuarters,
        seriesLabels,
      },
    };
  }

  // Chiave di confronto per evitare loop / richiami inutili
  const key = JSON.stringify(payloadCore);
  if (lastDescKeyRef.current === key) return;
  lastDescKeyRef.current = key;

  // Posticipa a dopo il paint per essere sicuri che il DOM del grafico esista
  const raf = requestAnimationFrame(() => {
    setDescription({ ...payloadCore, getNode: () => chartRef.current });
  });
  return () => cancelAnimationFrame(raf);

  // Dipendenze MINIME e stabili (niente chartRef.current qui!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  setDescription,
  data?.length,
  compareMode,
  year, month, quarter,
  baseYearForIntra,
  // array resi stabili con join
  selectedYears.join(","),
  selectedMonths.join(","),
  selectedQuarters.join(","),
  seriesLabels.join("|"),
]);*/

// === Description per export (safe & serializzabile) ===
useEffect(() => {
  if (typeof setDescription !== "function") return;
  if (!data || data.length === 0) return;

  const id = "water_by_building";
  const title = "Consumo idrico per edificio (anno/mese/trimestre)";

  let payload;
  if (compareMode === "none") {
    const { startDate, endDate } = rangeFor({ year, month, quarter });
    payload = {
      type: "chart",
      id,
      title,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      filters: { mode: compareMode, year, month, quarter },
    };
  } else {
    const list =
      compareMode === "anni"
        ? [...selectedYears].sort((a, b) => a - b).map((y) => ({
            label: String(y),
            ...rangeFor({ year: y }),
          }))
        : compareMode === "mesi"
        ? [...selectedMonths].sort((a, b) => a - b).map((m) => ({
            label: `${String(m).padStart(2, "0")}/${baseYearForIntra}`,
            ...rangeFor({ year: baseYearForIntra, month: m }),
          }))
        : [...selectedQuarters].sort((a, b) => a - b).map((q) => ({
            label: `Q${q}/${baseYearForIntra}`,
            ...rangeFor({ year: baseYearForIntra, quarter: q }),
          }));

    payload = {
      type: "chart",
      id,
      title,
      periods: list.map((p) => ({
        label: p.label,
        start: p.startDate.toISOString(),
        end: p.endDate.toISOString(),
      })),
      filters: {
        mode: compareMode,
        baseYear: baseYearForIntra,
        years: selectedYears,
        months: selectedMonths,
        quarters: selectedQuarters,
        seriesLabels,
      },
    };
  }

  // invia SOLO se cambia realmente
  const nextKey = JSON.stringify(payload);
  if (lastDescKeyRef.current === nextKey) return;
  lastDescKeyRef.current = nextKey;

  // nessuna funzione nel payload (serializzabile da JSON)
  setDescription(payload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  setDescription,
  data?.length,
  compareMode,
  year,
  month,
  quarter,
  baseYearForIntra,
  selectedYears.join(","),
  selectedMonths.join(","),
  selectedQuarters.join(","),
  seriesLabels.join("|"),
]);
  // ====== EXPORT PDF ======
  const handleExportToPDF = async () => {
    if (!chartRef.current) return;
    try {
      const node = chartRef.current;
      const canvas = await html2canvas(node);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4");
      pdf.setFontSize(14);
      pdf.text(
        compareMode === "none"
          ? "Consumi idrici per edificio"
          : `Consumi idrici per edificio — Confronto ${compareMode}`,
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
          `Filtri: Anno ${year}${month ? `, Mese ${String(month).padStart(2, "0")}` : ""}${quarter ? `, Trimestre ${quarter}` : ""}`,
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
          pdf.text("Dati (edificio — consumo m³):", margin, y);
          y += 6;
          for (const d of data) {
            if (y > pageHeight - 10) { pdf.addPage(); y = 10; }
            pdf.text(`${d.edificio} — ${d.consumo} m³`, margin, y);
            y += 6;
          }
        } else {
          pdf.text("Dati confronto:", margin, y);
          y += 6;
          for (const d of data) {
            if (y > pageHeight - 10) { pdf.addPage(); y = 10; }
            const line = `${d.edificio} — ` + seriesLabels.map((s) => `${s}: ${d[s] || 0} m³`).join(" | ");
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

      pdf.save(`Consumi_Acqua_Edificio${fileSuffix}.pdf`);
    } catch (error) {
      console.error("Errore durante l'esportazione PDF:", error?.message || error);
    }
  };

  /* ==============================
     UI helpers (selettori multipli)
     ============================== */

  const YearsMultiSelect = () => (
    <select
      multiple
      value={selectedYears}
      onChange={(e) => {
        const opts = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10));
        setSelectedYears(opts);
      }}
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[140px] h-28"
    >
      {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );

  const MonthsMultiSelect = () => (
    <select
      multiple
      value={selectedMonths}
      onChange={(e) => {
        const opts = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10));
        setSelectedMonths(opts);
      }}
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[160px] h-28"
    >
      {[
        "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
        "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
      ].map((m, i) => (
        <option key={i + 1} value={i + 1}>{`${String(i + 1).padStart(2,"0")} - ${m}`}</option>
      ))}
    </select>
  );

  const QuartersMultiSelect = () => (
    <select
      multiple
      value={selectedQuarters}
      onChange={(e) => {
        const opts = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10));
        setSelectedQuarters(opts);
      }}
      className="mt-1 p-2 rounded bg-gray-700 text-white min-w-[140px] h-28"
    >
      {[1,2,3,4].map((q) => (
        <option key={q} value={q}>{`Q${q}`}</option>
      ))}
    </select>
  );

  /* ==============================
     RENDER
     ============================== */

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      {/* Controlli principali */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">

        {/* Modalità confronto */}
        <div>
          <label className="block text-sm font-semibold">Modalità</label>
          <select
            value={compareMode}
            onChange={(e) => {
              const mode = e.target.value;
              setCompareMode(mode);
              // reset selezioni non pertinenti
              if (mode === "none") { setSelectedYears([currentYear]); setSelectedMonths([1,2,3]); setSelectedQuarters([1,2]); }
            }}
            className="mt-1 p-2 rounded bg-gray-700 text-white"
          >
            <option value="none">Periodo singolo</option>
            <option value="anni">Confronto Anni</option>
            <option value="mesi">Confronto Mesi (stesso anno)</option>
            <option value="trimestri">Confronto Trimestri (stesso anno)</option>
          </select>
        </div>

        {/* Filtri per modalità singola */}
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
                {[1,2,3,4].map((q) => (
                  <option key={q} value={q}>{`Q${q}`}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Filtri per confronto anni */}
        {compareMode === "anni" && (
          <div>
            <label className="block text-sm font-semibold">Anni (multi)</label>
            <YearsMultiSelect />
          </div>
        )}

        {/* Filtri per confronto mesi */}
        {compareMode === "mesi" && (
          <>
            <div>
              <label className="block text-sm font-semibold">Anno base</label>
              <select
                value={baseYearForIntra}
                onChange={(e) => setBaseYearForIntra(parseInt(e.target.value,10))}
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

        {/* Filtri per confronto trimestri */}
        {compareMode === "trimestri" && (
          <>
            <div>
              <label className="block text-sm font-semibold">Anno base</label>
              <select
                value={baseYearForIntra}
                onChange={(e) => setBaseYearForIntra(parseInt(e.target.value,10))}
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

      {/* Azione export */}
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

      {/* Stato */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : data.length === 0 ? (
        <p className="text-gray-400">Nessun dato disponibile per i filtri selezionati.</p>
      ) : (
        <div ref={chartRef} className="bg-white p-4 rounded">
          <ResponsiveContainer width="100%" height={360}>
            <ReBarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="edificio" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ backgroundColor: "#f9f9f9", color: "#000" }} />
              <Legend />
              {compareMode === "none" ? (
                <Bar dataKey="consumo" fill={COLORS[0]} />
              ) : (
                seriesLabels.map((label, idx) => (
                  <Bar key={label} dataKey={label} fill={COLORS[idx % COLORS.length]} />
                ))
              )}
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WaterConsumptionByBuildingChart;