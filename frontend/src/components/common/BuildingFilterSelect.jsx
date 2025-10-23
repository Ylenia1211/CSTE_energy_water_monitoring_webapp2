/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `ChartReportSelector`, che permette
 * all'utente di selezionare dinamicamente un pannello grafico da un elenco predefinito.
 * Ogni pannello rappresenta un grafico con dati energetici specifici come corrente,
 * voltaggio, potenza ed energia. Il componente utilizza un menu a tendina per la selezione
 * e visualizza il contenuto corrispondente al pannello selezionato.
 *
 * @module BuildingFilterSelect
 */

import React, { useState, useEffect } from "react";
import { fetchMetersData } from "../../utils/consumiAPI";
import Select from "react-select";

/**
 * BuildingFilterSelect Component
 *
 * Permette di selezionare edifici e impianti per applicare dei filtri.
 * I dati vengono recuperati tramite un'API esterna.
 *
 * @component
 * @param {Object} props - I parametri del componente
 * @param {Function} props.onFilterChange - Funzione chiamata per notificare i filtri selezionati.
 * Riceve un oggetto `{ buildings: string[], impianti: string[] }`.
 * @param {string[]} [props.initialSelectedBuildings=[]] - Lista iniziale degli edifici selezionati.
 * @param {string[]} [props.initialSelectedImpianti=[]] - Lista iniziale degli impianti selezionati.
 * @param {boolean} [props.darkMode=false] - Abilita il tema scuro per il componente.
 *
 * @example
 * <BuildingFilterSelect
     initialSelectedBuildings={filters.buildings}
     initialSelectedImpianti={filters.impianti}
     onFilterChange={updateFilters}
 *   darkMode={true}
 * />
 *
 * @returns {JSX.Element} Un componente React per la selezione di edifici e impianti.
 */
const BuildingFilterSelect = ({
  onFilterChange,
  initialSelectedBuildings = [],
  initialSelectedImpianti = [],
  darkMode = false,
}) => {
  const [selectedBuildings, setSelectedBuildings] = useState(
    initialSelectedBuildings
  );
  const [availableImpianti, setAvailableImpianti] = useState([]);
  const [selectedImpianti, setSelectedImpianti] = useState(
    initialSelectedImpianti
  );
  const [buildingsData, setBuildingsData] = useState({
    buildings: [],
    impiantiByBuilding: {},
  });
  const [loading, setLoading] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);

  /**
   * Effetto per recuperare i dati degli edifici e impianti.
   * Recupera i dati tramite `fetchMetersData` e li pulisce eliminando valori null o NaN.
   *
   * @async
   * @function fetchBuildingsAndImpianti
   * @returns {void}
   */
  useEffect(() => {
    const fetchBuildingsAndImpianti = async () => {
      try {
        const response = await fetchMetersData();

        // Verifica se la risposta contiene i dati attesi
        if (response) {
          // Pulisce i dati, rimuovendo NaN dai valori degli impianti e gestendo eventuali null
          const cleanImpiantiData = Object.entries(response).reduce(
            (acc, [building, impianti]) => {
              // Se impianti non è un array o è null, continua al prossimo edificio
              if (!Array.isArray(impianti)) {
                return acc;
              }

              // Rimuove NaN e null dai valori degli impianti
              const validImpianti = impianti.filter(
                (impianto) => impianto !== null
              );
              if (validImpianti.length > 0) {
                acc.impiantiByBuilding[building] = validImpianti;
                acc.buildings.push(building);
              }
              return acc;
            },
            { buildings: [], impiantiByBuilding: {} }
          );

          setBuildingsData(cleanImpiantiData);
        } else {
          console.error(
            "Dati non disponibili o struttura della risposta non corretta."
          );
        }

        setLoading(false);
      } catch (error) {
        console.error("Errore nel recupero dei dati:", error.message);
        setLoading(false);
      }
    };

    fetchBuildingsAndImpianti();
  }, []);

  /**
   * Gestisce il cambio di selezione degli edifici.
   *
   * @function handleBuildingChange
   * @param {Array<Object>} selectedOptions - Array di opzioni selezionate dal componente `react-select`.
   */
  const handleBuildingChange = (selectedOptions) => {
    setFiltersApplied(false);
    const selectedBuildings = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setSelectedBuildings(selectedBuildings);

    // Aggiorna gli impianti disponibili in base agli edifici selezionati
    const filteredImpianti = selectedBuildings.flatMap(
      (building) => buildingsData.impiantiByBuilding[building] || []
    );
    setAvailableImpianti(filteredImpianti);
    setSelectedImpianti([]); // Resetta gli impianti selezionati
  };

  /**
   * Gestisce il cambio di selezione degli impianti.
   *
   * @function handleImpiantoChange
   * @param {Array<Object>} selectedOptions - Array di opzioni selezionate dal componente `react-select`.
   */
  const handleImpiantoChange = (selectedOptions) => {
    setFiltersApplied(false);
    const selectedImpianti = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setSelectedImpianti(selectedImpianti);
  };

  /**
   * Applica i filtri selezionati e notifica il componente genitore.
   *
   * @function applyFilters
   * @returns {void}
   */
  const applyFilters = () => {
    setFiltersApplied(false);
    onFilterChange({
      buildings: selectedBuildings,
      impianti: selectedImpianti,
    });
    setFiltersApplied(true);
  };

  // Crea le opzioni per il selettore degli edifici
  const buildingOptions = buildingsData.buildings.map((building) => ({
    value: building,
    label: building,
  }));

  // Crea le opzioni per il selettore degli impianti
  const impiantoOptions = availableImpianti.map((impianto) => ({
    value: impianto,
    label: impianto,
  }));

  return (
    <div
      className={`mb-6 flex justify-center space-x-4 ${
        darkMode ? " p-4 rounded" : ""
      }`}
    >
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          <div>
            <h2
              className={`text-l mb-1 ${
                darkMode ? "text-gray-100" : ""
              }`}
            >
              Filtra Edifici
            </h2>
            <Select
              isMulti
              options={buildingOptions}
              value={buildingOptions.filter((option) =>
                selectedBuildings.includes(option.value)
              )}
              onChange={handleBuildingChange}
              placeholder="Filtra edifici"
              className="mb-4"
            />
          </div>

          <div>
            <h2
              className={`text-l mb-1 ${
                darkMode ? "text-gray-100" : ""
              }`}
            >
              Filtra Impianti
            </h2>
            <Select
              isMulti
              options={impiantoOptions}
              value={impiantoOptions.filter((option) =>
                selectedImpianti.includes(option.value)
              )}
              onChange={handleImpiantoChange}
              placeholder="Filtra impianti"
              isDisabled={availableImpianti.length === 0}
              className="mb-4"
            />
          </div>

          {/* <button
            onClick={applyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Applica Filtri
          </button> */}

          <div className="flex flex-col justify-end h-[65px]">
            <button
              type="button"
              onClick={applyFilters}
              className="px-3 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded"
            >
              Applica
            </button>
          </div>

          {filtersApplied && (
            <div
              className={`flex flex-col justify-end h-[75px] ${
                darkMode ? "" : ""
              }`}
            >
              <p className="px-2 py-2 text-green-500 ">
                Filtri applicati con successo!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuildingFilterSelect;
