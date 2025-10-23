/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente `TimeRangePicker`, che permette all'utente di selezionare un intervallo di tempo predefinito (giorno, settimana, mese) o un periodo personalizzato per calcolare i consumi o visualizzare i dati.
 * Il componente supporta anche la funzionalità di "Realtime" tramite una checkbox (Ancora da implementare).
 *
 * @module TimeRangePicker
 */

import React, { useState, useEffect } from "react";

/**
 * Componente `TimeRangePicker` che consente agli utenti di selezionare un intervallo di tempo predefinito (giorno, settimana, mese) o un intervallo personalizzato.
 * Supporta una checkbox per abilitare o disabilitare la visualizzazione in tempo reale dei dati.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <TimeRangePicker
 *   onSelectRange={handleRangeSelect}
 *   isLoading={false}
 *   defaultRange="week"
 *   showRealtimeCheckbox={true}
 * />
 *
 * @param {function} onSelectRange - Funzione callback chiamata quando un intervallo di tempo viene selezionato, passando i parametri `start`, `end`, `range`, e `isRealtime`.
 * @param {boolean} isLoading - Stato che indica se i dati sono in fase di caricamento, per disabilitare i pulsanti durante il caricamento.
 * @param {string} defaultRange - Intervallo di tempo predefinito da visualizzare all'inizio (valori possibili: "day", "week", "month", "custom").
 * @param {boolean} showRealtimeCheckbox - Determina se visualizzare o meno la checkbox per la modalità "Realtime".
 *
 * @returns {JSX.Element} Un componente che permette di selezionare un intervallo di tempo e di attivare/disattivare la modalità "Realtime".
 */
const TimeRangePicker = ({
  onSelectRange,
  isLoading,
  defaultRange,
  showRealtimeCheckbox = false,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customPeriod, setCustomPeriod] = useState(false);
  const [activeRange, setActiveRange] = useState(defaultRange);
  const [isRealtime, setIsRealtime] = useState(false); // Stato per la checkbox realtime

  /**
   * Funzione per gestire i range predefiniti (giorno, settimana, mese).
   * Quando viene selezionato un intervallo, aggiorna le date di inizio e fine e
   * invia l'intervallo selezionato al componente genitore tramite `onSelectRange`.
   *
   * @param {string} range - Il range di tempo selezionato (giorno, settimana, mese).
   */
  const handlePresetRange = (range) => {
    const now = new Date();
    let start, end;

    end = now; // La data di fine è sempre il momento attuale
    switch (range) {
      case "day":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Esattamente 24 ore prima
        break;
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Esattamente 7 giorni prima
        break;
      case "month":
        start = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        ); // Un mese prima, stessa ora
        break;
      default:
        return;
    }

    console.log(start, end);

    setStartDate(start); // Formatta la data per gli input
    setEndDate(end);
    setCustomPeriod(false); // Disattiva il periodo personalizzato quando un periodo predefinito è selezionato
    setActiveRange(range);

    // Passa il range selezionato al componente genitore
    onSelectRange(start, end, range, isRealtime);
  };
  /**
   * Funzione per gestire la selezione del periodo personalizzato.
   * Quando l'utente attiva/disattiva il periodo personalizzato, aggiorna lo stato `customPeriod`.
   */
  const handleCustomPeriod = () => {
    setCustomPeriod(!customPeriod);
    if (customPeriod && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      onSelectRange(start, end, "custom", isRealtime);
    }
  };

  /**
   * Funzione per gestire il cambiamento manuale delle date di inizio e fine.
   * Verifica che la data di inizio sia antecedente a quella di fine e invia le date selezionate al componente genitore.
   */
  const handleDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Verifica che la data di inizio sia antecedente a quella di fine
      if (start < end) {
        // Chiamare solo quando l'utente conferma l'intervallo personalizzato
        onSelectRange(start, end, "custom", isRealtime);
      } else {
        alert("La data di inizio non può essere successiva alla data di fine.");
      }
    }
  };

  // Aggiornare activeRange quando defaultRange cambia
  useEffect(() => {
    setActiveRange(defaultRange);
  }, [defaultRange]);

  /**
   * Funzione per gestire il cambio della checkbox realtime.
   * Invia l'intervallo di tempo selezionato al componente genitore, con la modalità "Realtime" aggiornata.
   */
  const handleRealtimeChange = () => {
    setIsRealtime(!isRealtime);
    onSelectRange(
      new Date(startDate),
      new Date(endDate),
      activeRange,
      !isRealtime
    );
  };

  return (
    <div className="time-range-picker">
      <div className="range-buttons mb-4 flex justify-center space-x-2">
        <button
          onClick={() => handlePresetRange("day")}
          className={`${
            activeRange === "day" ? "bg-indigo-900 text-white" : "bg-gray-200"
          } p-1 rounded-full text-sm`}
          disabled={isLoading}
        >
          Ultimo Giorno
        </button>
        <button
          onClick={() => handlePresetRange("week")}
          className={`${
            activeRange === "week" ? "bg-indigo-900  text-white" : "bg-gray-200"
          } p-1 rounded-full text-sm`}
          disabled={isLoading}
        >
          Ultima Settimana
        </button>
        <button
          onClick={() => handlePresetRange("month")}
          className={`${
            activeRange === "month" ? "bg-indigo-900  text-white" : "bg-gray-200"
          } p-1 rounded-full text-sm`}
          disabled={isLoading}
        >
          Ultimo Mese
        </button>
        <button
          onClick={handleCustomPeriod}
          className={`${
            activeRange === "custom" ? "bg-indigo-900  text-white" : "bg-gray-200"
          } p-1 rounded-full text-sm`}
          disabled={isLoading}
        >
          Periodo Personalizzato
        </button>
        {/* Checkbox per abilitare/disabilitare il "real-time" */}
        {showRealtimeCheckbox && (
          <div className="realtime-checkbox flex  items-center text-lg">
            <input
              type="checkbox"
              checked={isRealtime}
              onChange={handleRealtimeChange}
              id="realtime-checkbox"
              className="mr-2"
            />
            <label htmlFor="realtime-checkbox"> Realtime </label>
          </div>
        )}
      </div>

      {customPeriod && (
        <div className="custom-period mb-2 flex justify-center space-x-3">
          <label>
            Data Inizio:
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <label>
            Data Fine:
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <button
            onClick={handleDateChange}
            className="bg-indigo-900 hover:bg-indigo-400   text-white p-1 rounded ml-1"
            disabled={isLoading}
          >
            Calcola Consumi
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeRangePicker;
