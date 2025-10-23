/**
 * @namespace utils
 * @fileoverview
 * Modulo per l'esportazione dei dati in vari formati (Excel, PDF) dal backend.
 *
 * Questo modulo include le funzioni necessarie per:
 * - Generare e configurare le colonne per l'esportazione dei dati in Excel.
 * - Esportare i dati in formato Excel direttamente dal backend, sia tramite una configurazione personalizzata che tramite query predefinite.
 * - Esportare i dati in formato PDF, permettendo la creazione di documenti con sezioni configurabili.
 *
 * Le funzioni di questo modulo si interfacciano con il backend per ricevere i dati da esportare,
 * e poi li restituiscono all'utente in un formato scaricabile (Excel o PDF).
 *
 * @module exportAPI
 * @requires axiosInstance
 *
 * @example
 * // Esempio di utilizzo per esportare dati in Excel:
 * const data = [{ name: 'John', age: 30 }];
 * exportToExcel('users_data', data);
 */

import axiosInstance from "./api";

const BASE_API = "/export";

/**
 * Genera la configurazione delle colonne per l'esportazione in Excel.
 *
 * @param {Array<Object>} data - I dati da cui estrarre le configurazioni delle colonne.
 * @returns {Array<Object>} - La configurazione delle colonne per l'esportazione.
 *
 * @example
 * const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
 * const columnsConfig = generateColumnsConfig(data);
 * console.log(columnsConfig);
 */
export const generateColumnsConfig = (data) => {
  const keys = Object.keys(data[0] || {});
  console.log(keys);

  const columnsConfig = keys.map((key) => ({
    header: key.charAt(0).toUpperCase() + key.slice(1),
    key: key,
    width: key.length,
  }));

  const columnWidths = columnsConfig.reduce((acc, col) => {
    acc[col.key] = col.header.length;
    return acc;
  }, {});

  data.forEach((row) => {
    keys.forEach((key) => {
      const cellValue = row[key] || "";
      const cellLength = cellValue.toString().length;

      if (cellLength > columnWidths[key]) {
        columnWidths[key] = cellLength;
      }
    });
  });

  return columnsConfig.map((col) => ({
    ...col,
    width: columnWidths[col.key] + 2,
  }));
};

/**
 * Esporta i dati in formato Excel.
 *
 * @param {string} title - Il titolo del file Excel.
 * @param {Array<Object>} data - I dati da esportare.
 * @param {Array<Object>} [columnsConfig] - La configurazione delle colonne (opzionale). Se non passata, verrà generata automaticamente.
 * @returns {Promise<void>} - Una promessa che si risolve al termine dell'esportazione.
 *
 * @example
 * const data = [{ name: 'John', age: 30 }];
 * exportToExcel('users_data', data);
 */
export const exportToExcel = async (
  title = "exported_data",
  data,
  columnsConfig
) => {
  if (!columnsConfig) {
    columnsConfig = generateColumnsConfig(data);
  }

  try {
    const response = await axiosInstance.post(
      `${BASE_API}/excel`,
      {
        title,
        data,
        columnsConfig,
      },
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${title}.xlsx`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};

/**
 * Esporta i dati della query direttamente in formato Excel dal backend.
 *
 * @param {string} title - Il titolo del file Excel.
 * @param {string} serviceType - Il tipo di servizio per la query.
 * @param {string} queryName - Il nome della query da eseguire.
 * @param {Object} [params] - I parametri della query (opzionali).
 * @param {Array<Object>} [columnsConfig] - La configurazione delle colonne (opzionale).
 * @returns {Promise<void>} - Una promessa che si risolve al termine dell'esportazione.
 *
 * @example
 * exportQueryDataToExcel('query_data', 'serviceType', 'query1', { filter: 'active' });
 */
export const exportQueryDataToExcel = async (
  title = "exported_data",
  serviceType,
  queryName,
  params = null,
  columnsConfig = null
) => {
  try {
    const body = {
      title,
      serviceType,
      queryName,
      params,
      columnsConfig,
    };

    const response = await axiosInstance.post(
      `${BASE_API}/export-query-data`,
      body,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${title}.xlsx`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Errore durante l'esportazione dei dati:", error);
  }
};



/**
 * Esporta i dati in formato PDF dal backend.
 *
 * @param {string} title - Il titolo del file PDF.
 * @param {Array<Object>} sections - Le sezioni da includere nel PDF.
 * @returns {Promise<void>} - Una promessa che si risolve al termine dell'esportazione.
 *
 * @example
 * exportQueryDataToPDF('report_title', [{ sectionName: 'Overview', data: [...] }]);
 */
export const exportQueryDataToPDF = async (
  title = "exported_data",
  sections
) => {
  try {
    const body = {
      title,
      sections,
    };

    const response = await axiosInstance.post(`${BASE_API}/export-pdf`, body, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${title}.pdf`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Errore durante l'esportazione dei dati per il PDF:", error);
    alert(
      "Errore durante l'esportazione. Controlla la console per i dettagli."
    );
  }
};
