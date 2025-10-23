/**
 * @fileoverview
 * @namespace components
 * Componente per la selezione e visualizzazione dinamica di grafici energetici
 * con ricerca, raggruppamento per categoria, filtro energia/idrico/tutti,
 * persistenza su localStorage e pulsante Reset.
 *
 * @module ChartReportSelector
 */

import React, { useEffect, useMemo, useState } from "react";

// Grafici esistenti
import TimeSeriesChartByBuilding from "../dashboard/charts/TimeSeriesChartByBuilding";
import BuildingEnergyConsumptionChartPanel from "../dashboard/charts/BuildingEnergyConsumptionChartPanel";

// Grafici aggiuntivi (da AdvancedAnalysis)
import WeeklyBarChart from "../dashboard/charts/WeeklyBarChart"; //ok
import HourlyConsumptionChart from "../dashboard/charts/HoulyConsumptionChart"; //ok
import HourlyAverageConsumptionTotalChart from "../dashboard/charts/HourlyAverageConsumptionTotalChart"; //ok
import WaterConsumptionByBuildingChart from "../dashboard/charts/WaterConsumptionByBuildingChart";
import WaterCostByBuildingChart from "../dashboard/charts/WaterCostByBuildingChart";

const LS_KEY_PREFIX = "chartReportSelector";
const LS_KEYS = {
  selectedId: `${LS_KEY_PREFIX}.selectedId`,
  search: `${LS_KEY_PREFIX}.search`,
  filter: `${LS_KEY_PREFIX}.filter`, // 'all' | 'energia' | 'idrico'
};

const ChartReportSelector = ({ getDescription }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'energia' | 'idrico'
  const [selectedId, setSelectedId] = useState("panel_energy_consumption");

  // === Carica stato da localStorage ===
  useEffect(() => {
    try {
      const savedId = localStorage.getItem(LS_KEYS.selectedId);
      const savedSearch = localStorage.getItem(LS_KEYS.search);
      const savedFilter = localStorage.getItem(LS_KEYS.filter);
      if (savedId) setSelectedId(savedId);
      if (savedSearch !== null) setSearch(savedSearch);
      if (["all", "energia", "idrico"].includes(savedFilter))
        setFilter(savedFilter);
    } catch {
      // Ignora errori storage
    }
  }, []);

  // === Salva stato su localStorage ===
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.selectedId, selectedId);
      localStorage.setItem(LS_KEYS.search, search);
      localStorage.setItem(LS_KEYS.filter, filter);
    } catch {
      // Ignora errori storage
    }
  }, [selectedId, search, filter]);

  const handleDescription = (description) => {
    if (typeof getDescription === "function") {
      getDescription(description);
    }
  };

  /** Definizione pannelli */
  const panels = useMemo(
    () => [
      // ===== Energia – Pannelli aggregati =====
      {
        id: "panel_energy_consumption",
        category: "Energia – Pannelli",
        kind: "energia",
        title:
          "Consumi energetici per edificio/impianto (periodo personalizzato)",
        content: (
          <BuildingEnergyConsumptionChartPanel
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "panel_weekly_bar",
        category: "Energia – Pannelli",
        kind: "energia",
        title: "Consumi energetici settimanali (per edificio/impianto)",
        content: <WeeklyBarChart  setDescription={handleDescription} />,
      },
      {
        id: "panel_hourly_consumption",
        category: "Energia – Pannelli",
        kind: "energia",
        title: "Consumi medi per edificio e impianto per orario",
        content: <HourlyConsumptionChart setDescription={handleDescription} />,
      },
      {
        id: "panel_hourly_avg_total",
        category: "Energia – Pannelli",
        kind: "energia",
        title: "Consumi medi totali per orario (per edificio)",
        content: <HourlyAverageConsumptionTotalChart setDescription={handleDescription} />,
      },

      // ===== Energia – Serie storiche =====
      {
        id: "ts_current",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Corrente",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="A"
            unit="A"
            title="Corrente"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_voltage",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Voltaggio",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="PhV"
            unit="V"
            title="Voltaggio"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_totw",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Potenza totale attiva",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotW"
            unit="W"
            title="Potenza totale attiva"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_totva",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Potenza totale apparente",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotVA"
            unit="kVA"
            title="Potenza totale apparente"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_totvar",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Potenza totale reattiva",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotVAr"
            unit="VAr"
            title="Potenza totale reattiva"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_wh",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Energia totale attiva - Import/Export",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotWh"
            unit="kWh"
            title="Energia totale attiva - Import/Export"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_varh",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Energia totale reattiva - Import/Export",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotVArh"
            unit="kVArh"
            title="Energia totale reattiva - Import/Export"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_pf",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Fattore di potenza",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="TotPF"
            unit="W/VA"
            title="Fattore di potenza"
            setDescription={handleDescription}
          />
        ),
      },
      {
        id: "ts_freq",
        category: "Energia – Serie storiche",
        kind: "energia",
        title: "Frequenza",
        content: (
          <TimeSeriesChartByBuilding
            fieldName="frequency"
            unit="Hz"
            title="Frequenza"
            setDescription={handleDescription}
          />
        ),
      },

      // ===== Idrico =====
          {
        id: "water_by_building",
        category: "Idrico",
        kind: "idrico",
        title: "Consumo idrico per edificio (anno/mese/trimestre)",
        content: <WaterConsumptionByBuildingChart setDescription={handleDescription} />,
      },
      {
        id: "water_cost_by_building",
        category: "Idrico",
        kind: "idrico",
        title: "Costo idrico per edificio (anno/mese/trimestre)",
        content: <WaterCostByBuildingChart setDescription={handleDescription} />,
      },
    ],
    [handleDescription]
  );

  // === Filtri ===
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return panels.filter((p) => {
      const matchText = !q || p.title.toLowerCase().includes(q);
      const matchKind =
        filter === "all"
          ? true
          : filter === "energia"
          ? p.kind === "energia"
          : p.kind === "idrico";
      return matchText && matchKind;
    });
  }, [search, filter, panels]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, p) => {
      (acc[p.category] = acc[p.category] || []).push(p);
      return acc;
    }, {});
  }, [filtered]);

  const selectedPanel =
    filtered.find((p) => p.id === selectedId) || filtered[0] || panels[0];

  useEffect(() => {
    if (!filtered.find((p) => p.id === selectedPanel.id) && filtered[0]) {
      setSelectedId(filtered[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const chosen = panels.find((p) => p.id === id);
    if (chosen) handleDescription({ type: "panel", title: chosen.title, id });
  };

  const handleReset = () => {
    setSearch("");
    setFilter("all");
    setSelectedId("panel_energy_consumption");
    localStorage.removeItem(LS_KEYS.selectedId);
    localStorage.removeItem(LS_KEYS.search);
    localStorage.removeItem(LS_KEYS.filter);
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Seleziona un grafico</h1>
        <button
          onClick={handleReset}
          className="text-sm px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
        >
          Reset filtri
        </button>
      </div>

      {/* Ricerca + Filtro */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Cerca</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtra per titolo…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-gray-700 font-medium mb-2">
            Categoria
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tutti" },
              { key: "energia", label: "Solo energia" },
              { key: "idrico", label: "Solo idrico" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-2 rounded border ${
                  filter === key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Select raggruppata */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Scegli un pannello
        </label>
        <select
          value={selectedPanel?.id}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Object.entries(grouped).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Pannello selezionato */}
      <div className="bg-white p-4">
        <h2 className="text-xl font-bold mb-4">{selectedPanel?.title}</h2>
        {selectedPanel?.content}
      </div>
    </div>
  );
};

export default ChartReportSelector;