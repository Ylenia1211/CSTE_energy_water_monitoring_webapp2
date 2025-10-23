// Questo non è utilizzato

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchMetersData } from "../../utils/consumiAPI";

const TableFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [building, setBuilding] = useState([]);
  const [impianti, setImpianti] = useState([]);
  const [availableImpianti, setAvailableImpianti] = useState([]);
  const [buildingsData, setBuildingsData] = useState({
    buildings: [],
    impiantiByBuilding: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleImpiantoChange = (selectedOptions) => {
    const selectedImpianti = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setImpianti(selectedImpianti);
  };

  const validateDates = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("La data di inizio deve essere antecedente alla data di fine.");
      return false;
    }
    setError("");
    return true;
  };

  const applyFilters = () => {
    if (!validateDates()) {
      return;
    }
    onFilterChange({
      startDate,
      endDate,
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
            <label className="text-sm  mb-1 text-gray-300">
              Filtra Edifici
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
            <label className="text-sm  mb-1 text-gray-300">
              Filtra Impianti
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
              className="px-2 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded"
            >
              Applica
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default TableFilter;
