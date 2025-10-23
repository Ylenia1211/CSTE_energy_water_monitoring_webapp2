/**
 * @fileoverview
 * @namespace hooks
 * Questo file contiene il hook personalizzato `useTimeRange`, che gestisce l'intervallo di tempo attivo,
 * salva e recupera i dati da `localStorage` e calcola dinamicamente le date di inizio e fine in base al range selezionato.
 * Il hook offre un'interfaccia per selezionare e applicare un intervallo di tempo predefinito.
 *
 * @module useTimeRange
 */

import { useState, useEffect } from "react";

/**
 * Custom hook per la gestione dell'intervallo di tempo.
 * Questo hook gestisce l'intervallo di tempo attivo, salvando e recuperando i dati da `localStorage`
 * e calcolando le date di inizio e fine in base al range selezionato.
 * @hook
 *
 * @param {string} [defaultRange="week"] - Il range predefinito da utilizzare (può essere "day", "week", o "month").
 * @returns {Object} - Un oggetto contenente le seguenti proprietà:
 *   - `startDate`: La data di inizio dell'intervallo selezionato (oggetto `Date`).
 *   - `endDate`: La data di fine dell'intervallo selezionato (oggetto `Date`).
 *   - `activeRange`: Il range di tempo attualmente selezionato (una stringa: "day", "week", "month").
 *   - `handleSelectRange`: Funzione per impostare un nuovo intervallo di tempo.
 */
const useTimeRange = (defaultRange = "week") => {
  const [startDate, setStartDate] = useState(() => {
    const savedStartDate = localStorage.getItem("startDate");
    return savedStartDate ? new Date(savedStartDate) : null;
  });

  const [endDate, setEndDate] = useState(() => {
    const savedEndDate = localStorage.getItem("endDate");
    return savedEndDate ? new Date(savedEndDate) : null;
  });

  const [activeRange, setActiveRange] = useState(() => {
    const savedRange = localStorage.getItem("activeRange");
    return savedRange || defaultRange;
  });

  useEffect(() => {
    // Solo se le date sono null (ovvero non sono ancora impostate)
    if (!startDate || !endDate) {
      const now = new Date();
      let start, end;

      switch (activeRange) {
        case "day":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "week":
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
          break;
        case "month":
          start = new Date(now.setMonth(now.getMonth() - 1));
          end = new Date();
          break;
        default:
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
      }

      setStartDate(start);
      setEndDate(end);
    }
  }, [activeRange, startDate, endDate]);

  /**
   * Funzione per selezionare un nuovo intervallo di tempo.
   * Imposta le date di inizio e fine e memorizza il range selezionato in `localStorage`.
   *
   * @param {Date} start - La nuova data di inizio.
   * @param {Date} end - La nuova data di fine.
   * @param {string} range - Il range selezionato (può essere "day", "week", o "month").
   * @returns {void}
   */
  const handleSelectRange = (start, end, range) => {
    setStartDate(start);
    setEndDate(end);
    setActiveRange(range);

    // Memorizzare il range selezionato in localStorage
    localStorage.setItem("startDate", start);
    localStorage.setItem("endDate", end);
    localStorage.setItem("activeRange", range);
  };

  return { startDate, endDate, activeRange, handleSelectRange };
};

export default useTimeRange;
