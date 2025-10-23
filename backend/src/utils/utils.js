/**
 * @namespace utils
 * @fileoverview
 * Modulo per la gestione e la validazione delle date, proiezioni e filtri.
 *
 * Questo modulo fornisce diverse funzioni utili per:
 * 1. Validare intervalli di date e singole date.
 * 2. Creare proiezioni per la selezione di campi specifici.
 * 3. Applicare filtri basati su un intervallo di date.
 * 4. Generare colori casuali in formato esadecimale.
 * 5. Convertire e validare date in formato UTC.
 * 6. Gestire parametri di tipo array, incluso il parsing di stringhe JSON valide.
 *
 * @module utils
 */

const { ERROR_INVALID_DATE_RANGE, ERROR_DATE_ORDER } = require("./constants");

/**
 * Funzione per validare l'intervallo di date.
 * @param {string | Date} startDate - La data di inizio.
 * @param {string | Date} endDate - La data di fine.
 * @throws {Error} Se le date sono invalide o se la data di inizio è successiva a quella di fine.
 * @returns {Object} Oggetto contenente le date di inizio e fine validati.
 */
const validateDateRange = (startDate, endDate) => {
  const start = toUTCDate(new Date(startDate));
  const end = toUTCDate(new Date(endDate));

  if (isNaN(start) || isNaN(end)) {
    throw new Error(
      `${ERROR_INVALID_DATE_RANGE} ${start.toISOString()} ${end.toISOString()}`
    );
  }
  if (start > end) {
    throw new Error(ERROR_DATE_ORDER);
  }
  return { start, end };
};

/**
 * Funzione per creare una proiezione (projection) a partire da un elenco di campi.
 * @param {string} fields - Stringa di campi separati da virgola.
 * @returns {Object} Oggetto di proiezione.
 */
const createProjection = (fields) => {
  if (!fields) return {};
  return fields
    .split(",")
    .reduce((proj, field) => ({ ...proj, [field]: 1 }), {});
};

/**
 * Funzione per creare un filtro basato su un intervallo di date.
 * @param {Object} baseFilters - Filtro di base.
 * @param {Object} dateRange - Oggetto contenente la data di inizio e fine.
 * @returns {Object} Filtro completo con intervallo di date.
 */
const createFilters = (baseFilters, dateRange = {}) => ({
  ...baseFilters,
  datetime: { $gte: dateRange.start, $lte: dateRange.end },
});

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
};

/**
 * Valida una data in formato stringa.
 * @param {string} dateStr - La data in formato stringa.
 * @param {string} paramName - Il nome del parametro per il messaggio di errore.
 * @returns {Date} L'oggetto Date corrispondente.
 * @throws {Error} Se la data non è valida.
 */
function validateDate(dateStr, paramName) {
  const date = new Date(dateStr);
  if (isNaN(date)) {
    throw new Error(
      `La data fornita per "${paramName}" non è valida: ${dateStr}`
    );
  }
  return date;
}
function validateUTCDate(dateStr, paramName) {
  // Creiamo un oggetto Date in locale
  const date = new Date(dateStr);

  // Verifica che la data sia valida
  if (isNaN(date)) {
    throw new Error(
      `La data fornita per "${paramName}" non è valida: ${dateStr}`
    );
  }

  // Creiamo una nuova data UTC con gli stessi componenti della data locale
  // const utcDate = new Date(
  //   Date.UTC(
  //     date.getFullYear(),
  //     date.getMonth(),
  //     date.getDate(),
  //     date.getHours(),
  //     date.getMinutes(),
  //     date.getSeconds(),
  //     date.getMilliseconds()
  //   )
  // );

  return toUTCDate(date);
}

const toUTCDate = (date) => {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
};

const validateUTCDateRange = (startDate, endDate) => {
  // Creiamo gli oggetti Date in locale
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Verifica che le date siano valide
  if (isNaN(start) || isNaN(end)) {
    throw new Error(`${ERROR_INVALID_DATE_RANGE} ${startDate} ${endDate}`);
  }

  // Controlliamo l'ordine delle date
  if (start > end) {
    throw new Error(ERROR_DATE_ORDER);
  }

  // Convertiamo le date in UTC mantenendo l'ora esatta
  const startUTC = new Date(
    Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
      start.getSeconds(),
      start.getMilliseconds()
    )
  );

  const endUTC = new Date(
    Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
      end.getSeconds(),
      end.getMilliseconds()
    )
  );

  console.log("Start UTC:", startUTC.toISOString());
  console.log("End UTC:", endUTC.toISOString());

  return {
    start: startUTC,
    end: endUTC,
  };
};

/**
 * Converte un parametro in array, se necessario.
 * @param {any} value - Il valore da convertire in array.
 * @param {string} paramName - Il nome del parametro per il messaggio di errore.
 * @returns {Array} L'array corrispondente.
 * @throws {Error} Se il valore non è un array o una stringa JSON valida.
 */
function parseArray(value, paramName) {
  if (Array.isArray(value)) {
    return value;
  }
  try {
    return JSON.parse(value || "[]");
  } catch {
    throw new Error(
      `Il parametro "${paramName}" deve essere un array o una stringa JSON valida.`
    );
  }
}

module.exports = {
  validateDateRange,
  createProjection,
  createFilters,
  getRandomColor,
  parseArray,
  validateDate,
  validateUTCDate,
  validateUTCDateRange,
  toUTCDate,
};
