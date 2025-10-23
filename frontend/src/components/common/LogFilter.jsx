/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `LogFilter`, che fornisce un'interfaccia per filtrare
 * i log in base a parametri come la data, il tipo di messaggio, gli edifici e gli impianti.
 * Il componente gestisce il caricamento dei dati degli edifici e degli impianti, e applica i filtri
 * quando l'utente interagisce con i campi di selezione e le date.
 *
 * @module LogFilter
 */

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchMetersData } from "../../utils/consumiAPI";

/**
 * Componente di filtro per i log che permette di selezionare il tipo di log, edifici, impianti,
 * data di inizio e fine, e applicare i filtri.
 *
 * @component
 *
 * @param {Object} props - Le proprietà passate al componente.
 * @param {function} props.onFilterChange - Funzione callback che viene chiamata quando vengono applicati i filtri.
 *
 * @returns {JSX.Element} Un modulo che consente all'utente di applicare filtri per i log.
 */
const LogFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [building, setBuilding] = useState([]);
  const [impianti, setImpianti] = useState([]);
  const [availableImpianti, setAvailableImpianti] = useState([]);
  const [buildingsData, setBuildingsData] = useState({
    buildings: [],
    impiantiByBuilding: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Effettua il recupero dei dati sugli edifici e impianti quando il componente viene montato.
   */
  useEffect(() => {
    const fetchBuildingsAndImpianti = async () => {
      try {
        const response = await fetchMetersData();
        if (response) {
          const cleanImpiantiData = Object.entries(response).reduce(
            (acc, [building, impianti]) => {
              if (!Array.isArray(impianti)) {
                return acc;
              }
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
   * Gestisce il cambiamento della selezione degli edifici.
   *
   * @param {Array} selectedOptions - Opzioni selezionate per gli edifici.
   */
  const handleBuildingChange = (selectedOptions) => {
    const selectedBuildings = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setBuilding(selectedBuildings);

    const filteredImpianti = selectedBuildings.flatMap(
      (building) => buildingsData.impiantiByBuilding[building] || []
    );
    setAvailableImpianti(filteredImpianti);
    setImpianti([]); // Resetta gli impianti selezionati quando cambia la selezione degli edifici
  };

  /**
   * Gestisce il cambiamento della selezione degli edifici.
   *
   * @param {Array} selectedOptions - Opzioni selezionate per gli edifici.
   */
  const handleImpiantoChange = (selectedOptions) => {
    const selectedImpianti = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setImpianti(selectedImpianti);
  };

  /**
   * Valida le date selezionate.
   * La data di inizio deve essere antecedente alla data di fine.
   *
   * @returns {boolean} `true` se le date sono valide, altrimenti `false`.
   */
  const validateDates = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("La data di inizio deve essere antecedente alla data di fine.");
      return false;
    }
    setError("");
    return true;
  };

  /**
   * Applica i filtri basati sulle selezioni dell'utente.
   * Se le date sono valide, invia i dati al componente genitore tramite `onFilterChange`.
   */
  const applyFilters = () => {
    if (!validateDates()) {
      return;
    }
    onFilterChange({
      startDate,
      endDate,
      type,
      message,
      building,
      impianti,
    });
  };

  const buildingOptions = buildingsData.buildings.map((building) => ({
    value: building,
    label: building,
  }));

  const impiantoOptions = availableImpianti.map((impianto) => ({
    value: impianto,
    label: impianto,
  }));

  const typeOptions = [
    { value: "", label: "Tutte" },
    { value: "INFO", label: "INFO" },
    { value: "WARN", label: "WARN" },
    { value: "ERROR", label: "ERROR" },
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mb-4 flex flex-wrap gap-4 items-center bg-gray-800 p-4 rounded"
    >
      {loading ? (
        <p className="text-center w-full text-white">Caricamento...</p>
      ) : (
        <>
          {error && (
            <p className="text-red-500 text-center w-full mb-4">{error}</p>
          )}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Data inizio
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-[6px] border border-gray-300 rounded w-35 text-black"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Data fine
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-[6px] border border-gray-300 rounded w-35 text-black"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Tipo
            </label>
            <Select
              options={typeOptions}
              value={typeOptions.find((option) => option.value === type)}
              onChange={(selected) => setType(selected?.value || "")}
              placeholder="Tipo"
              className="w-32"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  borderColor: "rgb(75, 85, 99)",
                  color: "black",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "rgb(156, 163, 175)",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  color: "black",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "rgb(37, 99, 235)"
                    : "rgb(255, 255, 255)",
                  color: state.isSelected ? "white" : "black",
                  "&:hover": {
                    backgroundColor: "rgb(37, 99, 235)",
                    color: "white",
                  },
                }),
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Messaggio
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ricerca messaggio"
              className="p-[6px] border border-gray-300 rounded w-48 text-black"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Seleziona Edifici
            </label>
            <Select
              isMulti
              options={buildingOptions}
              value={buildingOptions.filter((option) =>
                building.includes(option.value)
              )}
              onChange={handleBuildingChange}
              placeholder="Edifici"
              className="w-full"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  borderColor: "rgb(75, 85, 99)",
                  color: "black",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "rgb(156, 163, 175)",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  color: "black",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "rgb(37, 99, 235)"
                    : "rgb(255, 255, 255)",
                  color: state.isSelected ? "white" : "black",
                  "&:hover": {
                    backgroundColor: "rgb(37, 99, 235)",
                    color: "white",
                  },
                }),
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Seleziona Impianti
            </label>
            <Select
              isMulti
              options={impiantoOptions}
              value={impiantoOptions.filter((option) =>
                impianti.includes(option.value)
              )}
              onChange={handleImpiantoChange}
              placeholder="Impianti"
              isDisabled={availableImpianti.length === 0}
              className="w-full"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  borderColor: "rgb(75, 85, 99)",
                  color: "black",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "rgb(156, 163, 175)",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "rgb(255, 255, 255)",
                  color: "black",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "rgb(37, 99, 235)"
                    : "rgb(255, 255, 255)",
                  color: state.isSelected ? "white" : "black",
                  "&:hover": {
                    backgroundColor: "rgb(37, 99, 235)",
                    color: "white",
                  },
                }),
              }}
            />
          </div>
          <div className="flex flex-col justify-end h-[62px]">
            <button
              type="button"
              onClick={applyFilters}
              className="px-2 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded "
            >
              Applica
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default LogFilter;
