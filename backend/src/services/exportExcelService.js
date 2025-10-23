/**
 * @namespace services
 * @fileoverview
 * Fornisce utilità per generare e gestire file Excel, con particolare attenzione alla configurazione dinamica delle colonne e alla gestione di dati complessi.
 * Questo modulo utilizza la libreria `ExcelJS` per creare file Excel in modo dinamico, adattando la larghezza delle colonne e gestendo oggetti annidati nei dati.
 *
 * Le funzionalità principali del modulo includono:
 * - `generateColumnsConfig`: Crea la configurazione delle colonne in base ai dati forniti, gestendo oggetti annidati, date e valori normali.
 * - `prepareRow`: Prepara i dati per l'inserimento nel foglio Excel, appiattendo eventuali oggetti annidati in un formato di chiavi dotate di notazione.
 * - `createExcelFile`: Genera un file Excel, applicando la configurazione delle colonne e aggiungendo i dati preparati.
 * - Calcolo automatico della larghezza ottimale delle colonne in base ai dati, per garantire una visualizzazione leggibile.
 * - Funzioni di supporto per gestire la capitalizzazione delle stringhe e il calcolo delle lunghezze delle celle.
 *
 * Questo modulo è utile in contesti in cui è necessario esportare dati strutturati in formato Excel, come report o esportazioni da database.
 *
 * @module exportExcelService
 */

const ExcelJS = require("exceljs");

/**
 * Genera la configurazione delle colonne basata sui dati forniti.
 * La configurazione tiene conto di oggetti annidati, date e valori normali.
 *
 * @param {Array<Object>} data - L'array di oggetti con i dati per generare la configurazione delle colonne.
 * @returns {Array<Object>} - L'array di configurazioni delle colonne per il foglio Excel.
 */
const generateColumnsConfig = (data) => {
  // Se `data[0]` ha una proprietà `_doc`, usa `_doc` per accedere ai dati reali
  const keys = Object.keys(data[0]._doc || data[0]);

  const columnsConfig = [];

  keys.forEach((key) => {
    const value = data[0]._doc ? data[0]._doc[key] : data[0][key];

    // Determina se il valore è una data, un oggetto annidato o un valore normale
    if (value instanceof Date) {
      columnsConfig.push({
        header: capitalizeFirstLetter(key),
        key: key,
        width: Math.max(key.length, 15),
      });
    } else if (value && typeof value === "object") {
      // Gestione delle proprietà annidate
      Object.keys(value).forEach((subKey) => {
        columnsConfig.push({
          header: `${capitalizeFirstLetter(key)}.${subKey}`,
          key: `${key}.${subKey}`,
          width: Math.max(subKey.length, 15),
        });
      });
    } else {
      columnsConfig.push({
        header: capitalizeFirstLetter(key),
        key: key,
        width: Math.max(key.length, 15),
      });
    }
  });

  // Calcola la larghezza massima per ciascuna colonna, considerando anche i valori nelle righe
  const columnWidths = calculateColumnWidths(columnsConfig, data, keys);

  // Ritorna la configurazione finale delle colonne con larghezze ottimizzate
  return columnsConfig.map((col) => ({
    ...col,
    width: columnWidths[col.key] + 2, // Margine per la leggibilità
  }));
};

/**
 * Calcola la larghezza massima delle colonne in base ai dati.
 *
 * @param {Array<Object>} columnsConfig - La configurazione delle colonne.
 * @param {Array<Object>} data - I dati su cui calcolare la larghezza.
 * @param {Array<string>} keys - Le chiavi dei dati.
 * @returns {Object} - Un oggetto con la larghezza massima per ogni colonna.
 */
const calculateColumnWidths = (columnsConfig, data, keys) => {
  const columnWidths = columnsConfig.reduce((acc, col) => {
    acc[col.key] = col.header.length;
    return acc;
  }, {});

  data.forEach((row) => {
    const currentRow = row._doc || row;
    keys.forEach((key) => {
      const value = currentRow[key];
      const cellLength = getCellLength(value, key);
      if (cellLength > columnWidths[key]) {
        columnWidths[key] = cellLength;
      }
    });
  });

  return columnWidths;
};

/**
 * Calcola la lunghezza della cella per il valore dato.
 *
 * @param {any} value - Il valore da cui calcolare la lunghezza.
 * @param {string} key - La chiave associata al valore (usata per i campi annidati).
 * @returns {number} - La lunghezza della cella.
 */
const getCellLength = (value, key) => {
  if (value instanceof Date) {
    return value.toString().length;
  } else if (value && typeof value === "object") {
    // Calcola la lunghezza per i valori annidati
    return Object.values(value).reduce((maxLen, subValue) => {
      return Math.max(maxLen, (subValue || "").toString().length);
    }, key.length); // Considera la lunghezza della chiave
  }
  return (value || "").toString().length;
};

/**
 * Capitalizza la prima lettera di una stringa.
 *
 * @param {string} str - La stringa da capitalizzare.
 * @returns {string} - La stringa con la prima lettera maiuscola.
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Prepara una riga di dati per l'inserimento nel foglio Excel.
 * Gestisce oggetti annidati e li appiattisce in chiavi dotate di notazione.
 *
 * @param {Object} row - La riga di dati da preparare.
 * @returns {Object} - La riga preparata, con chiavi appiattite.
 */
const prepareRow = (row) => {
  const data = row._doc || row;
  const flattenedRow = {};

  Object.keys(data).forEach((key) => {
    if (
      typeof data[key] === "object" &&
      data[key] !== null &&
      !(data[key] instanceof Date)
    ) {
      // Gestione delle proprietà annidate
      Object.keys(data[key]).forEach((subKey) => {
        flattenedRow[`${key}.${subKey}`] = data[key][subKey] || "NaN";
      });
    } else {
      flattenedRow[key] = data[key];
    }
  });

  return flattenedRow;
};

/**
 * Crea un file Excel con i dati e la configurazione delle colonne forniti.
 *
 * @param {string} title - Il titolo del foglio Excel.
 * @param {Array<Object>} data - I dati da includere nel file Excel.
 * @param {Array<Object>} columnsConfig - La configurazione delle colonne per il foglio Excel.
 * @returns {Promise<ExcelJS.Workbook>} - Il workbook Excel generato.
 */
const createExcelFile = async (title, data, columnsConfig) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);

  // Imposta le colonne del foglio
  sheet.columns = columnsConfig.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // Aggiungi i dati al foglio
  data.forEach((item) => {
    const preparedRow = prepareRow(item);
    sheet.addRow(preparedRow);
  });

  return workbook;
};

module.exports = {
  createExcelFile,
  generateColumnsConfig,
};
