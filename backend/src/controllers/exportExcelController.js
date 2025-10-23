/**
 * @fileoverview
 * Questo modulo gestisce le operazioni di esportazione dei dati in formato Excel, fornendo due funzioni principali:
 * 1. `exportData`: Esporta i dati forniti nel corpo della richiesta in un file Excel.
 * 2. `exportQueryData`: Esegue una query su un servizio specifico (come `anomalyService` o `energyDataService`) e esporta i risultati in un file Excel.
 *
 * Entrambe le funzioni generano un file Excel e lo inviano come risposta HTTP, impostando gli header necessari per il download.
 *
 * Le funzioni di supporto come `cleanParams`, `mapParamsToFunctionParams` e `getFunctionParameters` gestiscono la pulizia e l'adattamento dei parametri in ingresso e garantiscono che i dati siano formattati correttamente.
 *
 * @module exportExcelController
 */

const exportExcelService = require("../services/exportExcelService");
const anomalyService = require("../services/anomalyService");
const energyDataService = require("../services/energyDataService");

/**
 * Funzione che esporta i dati forniti nel corpo della richiesta in formato Excel.
 *
 * @async
 * @function exportData
 * @param {Object} req - Oggetto della richiesta HTTP, che contiene i dati da esportare.
 * @param {Object} res - Oggetto della risposta HTTP, utilizzato per inviare il file Excel al client.
 * @throws {Error} Lancia un errore se i dati o la configurazione delle colonne sono invalidi.
 * @returns {void}
 */
const exportData = async (req, res) => {
  try {
    const { title, data, columnsConfig } = req.body;

    // Verifica che i dati e la configurazione delle colonne siano validi
    if (!Array.isArray(data) || !Array.isArray(columnsConfig)) {
      return res.status(400).send({
        error: "Dati o configurazione delle colonne mancanti o non validi",
      });
    }

    // Crea il file Excel
    const workbook = await exportExcelService.createExcelFile(
      title,
      data,
      columnsConfig
    );

    // Imposta gli header per il download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${title}.xlsx`);

    // Scrive il file Excel nella risposta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Errore durante l'esportazione:", error);
    res.status(500).send({ error: "Errore interno del server" });
  }
};

/**
 * Funzione ricorsiva per rimuovere le proprietà con valori vuoti (null, undefined, stringhe vuote, array vuoti) da un oggetto.
 *
 * @function cleanParams
 * @param {Object} params - L'oggetto da cui rimuovere le proprietà con valori vuoti.
 * @returns {Object} Un nuovo oggetto con le proprietà vuote rimosse.
 */
const cleanParams = (params) => {
  if (typeof params !== "object" || params === null) {
    return {}; // Restituisce un oggetto vuoto se `params` non è valido
  }

  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          // Chiamata ricorsiva per oggetti annidati
          const cleanedValue = cleanParams(value);
          return [key, cleanedValue];
        }
        return [key, value];
      })
      .filter(([key, value]) => {
        if (typeof value === "string") {
          return value.trim() !== ""; // Mantieni solo se la stringa non è vuota
        }
        if (Array.isArray(value)) {
          return value.length > 0; // Mantieni solo se l'array non è vuoto
        }
        if (typeof value === "object" && value !== null) {
          return Object.keys(value).length > 0; // Mantieni solo se l'oggetto non è vuoto
        }
        return value !== undefined && value !== null; // Mantieni solo se il valore è definito e non null
      })
  );
};

/**
 * Funzione che esporta i dati restituiti da una query a un servizio specifico (anomalyService o energyDataService).
 *
 * @async
 * @function exportQueryData
 * @param {Object} req - Oggetto della richiesta HTTP, che contiene il nome del servizio, della query, i parametri e la configurazione delle colonne.
 * @param {Object} res - Oggetto della risposta HTTP, utilizzato per inviare il file Excel al client.
 * @throws {Error} Lancia un errore se il servizio o la query non esistono, o se i dati sono invalidi.
 * @returns {void}
 */
const exportQueryData = async (req, res) => {
  try {
    const { title, serviceType, queryName, params, columnsConfig } = req.body;

    // Verifica che il servizio richiesto esista
    const services = {
      anomalyService,
      energyDataService,
    };

    if (!services[serviceType]) {
      return res.status(400).send({ error: "Servizio non valido" });
    }

    // Recupera il servizio specificato
    const service = services[serviceType];

    // Verifica che la query esista nel servizio
    if (typeof service[queryName] !== "function") {
      return res
        .status(400)
        .send({ error: "Query non trovata nel servizio specificato" });
    }

    // Recupera la funzione della query
    const func = service[queryName];
    const funcParams = getFunctionParameters(func);

    // Adatta i parametri in base ai requisiti della funzione
    const adaptedParams = mapParamsToFunctionParams(
      cleanParams(params),
      funcParams
    );

    // Esegui la query con i parametri adattati
    const result = await func(...adaptedParams);

    // Determina la struttura dei dati restituiti
    let data = [];
    if (Array.isArray(result)) {
      data = result;
    } else if (result && typeof result === "object") {
      data =
        result.data ||
        result.items ||
        result.logs ||
        Object.values(result).find((value) => Array.isArray(value)) ||
        [];
    } else {
      return res.status(400).send({ error: "Dati restituiti non validi" });
    }

    // Genera la configurazione delle colonne se non è stata passata
    const finalColumnsConfig = Array.isArray(columnsConfig)
      ? columnsConfig
      : exportExcelService.generateColumnsConfig(data);

    // Verifica la validità dei dati e della configurazione delle colonne
    if (!Array.isArray(data) || !Array.isArray(finalColumnsConfig)) {
      return res.status(400).send({
        error: "Dati o configurazione delle colonne mancanti o non validi",
      });
    }

    // Crea il file Excel
    const workbook = await exportExcelService.createExcelFile(
      title,
      data,
      finalColumnsConfig
    );

    // Imposta gli header per il download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${title}.xlsx`);

    // Scrive il file Excel nella risposta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Errore durante l'esportazione:", error);
    res.status(500).send({ error: "Errore interno del server" });
  }
};

/**
 * Funzione per ottenere i parametri di una funzione, gestendo anche i valori predefiniti.
 *
 * @function getFunctionParameters
 * @param {Function} func - La funzione di cui ottenere i parametri.
 * @returns {Array} Un array con i nomi dei parametri della funzione.
 */
const getFunctionParameters = (func) => {
  const funcString = func.toString();
  const paramList = funcString.match(/\(([^)]*)\)/)[1];
  const params = [];

  // RegExp per trovare parametri e valori predefiniti
  const paramRegex = /([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(=\s*[^,)]*)?/g;
  let match;

  while ((match = paramRegex.exec(paramList)) !== null) {
    // Aggiungi il nome del parametro
    params.push(match[1].trim());
  }

  return params;
};

/**
 * Funzione per adattare i parametri in base ai tipi richiesti dalla funzione.
 *
 * @function mapParamsToFunctionParams
 * @param {Object} params - I parametri da adattare.
 * @param {Array} funcParams - I parametri accettati dalla funzione.
 * @returns {Array} Un array con i parametri adattati alla funzione.
 */
const mapParamsToFunctionParams = (params, funcParams) => {
  return funcParams.map((param) => {
    if (params.hasOwnProperty(param)) {
      const value = params[param];
      return value; // Restituisce il valore del parametro
    }
    return undefined; // Restituisce `undefined` se il parametro non è presente
  });
};

module.exports = {
  exportData,
  exportQueryData,
};
