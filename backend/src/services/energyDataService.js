/**
 * @namespace services
 * @fileoverview
 *
 * Logica per la gestione e il recupero dei dati energetici
 *
 * @module energyDataService
 */

const EnergyData = require("../models/energyDataModel");
const SensorInfo = require("../models/infoMetersModel");

const {
  createFilters,
  createProjection,
  getRandomColor,
  validateDateRange,
  validateUTCDate,
  parseArray,
} = require("../utils/utils");

/**
 * Funzione per recuperare i dati energetici con filtri e proiezione.
 * @param {Object} filters - Filtro da applicare alla query.
 * @param {Object} projection - Proiezione da applicare alla query.
 * @returns {Promise<Array>} Dati energetici recuperati.
 */
const queryEnergyData = async (filters, projection) => {
  return await EnergyData.find(filters, projection)
    .sort({ datetime: -1 })
    .lean();
};

/**
 * Funzione per aggregare i consumi energetici con una pipeline di aggregazione.
 * @param {Array} pipeline - Pipeline di aggregazione.
 * @returns {Promise<Array>} Risultato dell'aggregazione.
 */
const aggregateConsumption = async (pipeline) => {
  return await EnergyData.aggregate(pipeline).exec();
};

/**
 * Recupera l'ultimo documento disponibile per un edificio.
 * @async
 * @function getLiveValuesByBuilding
 * @param {string} building - Nome dell'edificio.
 * @returns {Promise<Object>} - Dati live per l'edificio.
 */
const getLiveValuesByBuilding = async (building) => {
  return await EnergyData.findOne({ building }).sort({ datetime: -1 }).lean();
};

/**
 * Recupera i dati energetici filtrati in base al range di date e ai campi specificati.
 * @async
 * @function getValuesByFilter
 * @param {string} startDate - Data di inizio.
 * @param {string} endDate - Data di fine.
 * @param {string} [fields=""] - Campi da includere.
 * @param {Object} [filters={}] - Filtri aggiuntivi.
 * @returns {Promise<Array>} - Dati recuperati.
 */
const getValuesByFilter = async (
  startDate,
  endDate,
  fields = "",
  filters = {}
) => {
  try {
    const { start, end } = validateDateRange(startDate, endDate);

    const dateFilter = { datetime: { $gte: start, $lte: end } };
    const projection = createProjection(fields);

    const queryFilters = { ...filters, ...dateFilter };

    return await EnergyData.find(queryFilters, projection);
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    throw new Error("Errore nel recupero dei dati");
  }
};

/**
 * Recupera l'ultimo valore disponibile in base ai filtri.
 * @param {Object} [filters={}] - Filtri da applicare.
 * @returns {Promise<Object>} - Ultimo valore disponibile.
 */
const getLiveValues = async (filters = {}) => {
  return await EnergyData.findOne(filters).sort({ datetime: -1 }).lean();
};

/**
 * Calcola il consumo totale di energia in un intervallo di date specificato.
 *
 * Esegue un'aggregazione per determinare il consumo totale sommando i valori di importazione
 * iniziale e finale per tutti gli impianti nel range temporale fornito.
 *
 * @async
 * @function getTotalConsumption
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @returns {Promise<Object>} - Un oggetto contenente i dettagli del consumo totale:
 *   - `startDate` {string} - La data di inizio fornita.
 *   - `endDate` {string} - La data di fine fornita.
 *   - `consumption` {number} - Consumo totale in kilowattora (kWh).
 *   - `unit` {string} - Unità di misura del consumo, sempre "kWh".
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 *
 * @throws {Error} Solleva un errore in caso di problemi con la validazione delle date o la pipeline di aggregazione.
 */
const getTotalConsumption = async (startDate, endDate) => {
  try {
    const { start, end } = validateDateRange(startDate, endDate);

    const results = await EnergyData.aggregate([
      { $match: { datetime: { $gte: start, $lte: end } } },
      { $sort: { datetime: 1 } },
      {
        $group: {
          _id: "$id",
          firstImport: { $first: "$TotWh.import" },
          lastImport: { $last: "$TotWh.import" },
        },
      },
      {
        $project: {
          id: "$_id",
          consumption: { $abs: { $subtract: ["$lastImport", "$firstImport"] } },
        },
      },
      { $group: { _id: null, totalConsumption: { $sum: "$consumption" } } },
    ]).exec();

    console.log(results);

    const totalConsumption = results[0]?.totalConsumption || 0;

    return { startDate, endDate, consumption: totalConsumption, unit: "kWh" };
  } catch (error) {
    console.error("Errore nel calcolo dei consumi totali:", error.message);
    return { error: error.message };
  }
};

/**
 * Calcola il consumo totale di energia per edificio in un intervallo di date specificato.
 *
 * Esegue un'aggregazione per determinare il consumo energetico totale per ogni edificio,
 * sommando il consumo di tutti gli impianti associati. I risultati includono il consumo totale
 * per edificio e l'unità di misura utilizzata.
 *
 * @async
 * @function getTotalConsumptionByBuilding
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @returns {Promise<Object>} - Un oggetto contenente i dettagli del consumo:
 *   - `startDate` {string} - La data di inizio fornita.
 *   - `endDate` {string} - La data di fine fornita.
 *   - `consumptionByBuilding` {Object[]} - Array di consumi totali per edificio:
 *       - `building` {string} - Nome dell'edificio.
 *       - `consumption` {number} - Consumo totale in kilowattora (kWh).
 *       - `unit` {string} - Unità di misura del consumo, sempre "kWh".
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 *
 * @throws {Error} Solleva un errore in caso di problemi con la validazione delle date o la pipeline di aggregazione.
 */
const getTotalConsumptionByBuilding = async (startDate, endDate) => {
  try {
    const { start, end } = validateDateRange(startDate, endDate);

    const results = await EnergyData.aggregate([
      { $match: { datetime: { $gte: start, $lte: end } } },
      { $sort: { datetime: 1 } },
      {
        $group: {
          _id: { building: "$building", id: "$id" },
          firstImport: { $first: "$TotWh.import" },
          lastImport: { $last: "$TotWh.import" },
        },
      },
      {
        $project: {
          building: "$_id.building",
          consumption: { $abs: { $subtract: ["$lastImport", "$firstImport"] } },
        },
      },
      {
        $group: {
          _id: "$building",
          totalConsumption: { $sum: "$consumption" },
        },
      },
      {
        $project: {
          _id: 0,
          building: "$_id",
          consumption: "$totalConsumption",
          unit: { $literal: "kWh" },
        },
      },
    ]
    ).exec();

    return { startDate, endDate, consumptionByBuilding: results };
  } catch (error) {
    console.error(
      "Errore nel calcolo dei consumi per edificio:",
      error.message
    );
    return { error: error.message };
  }
};

/**
 * Recupera i dati aggregati per un grafico a barre che rappresenta i consumi energetici
 * per edificio e impianto in un determinato intervallo di date.
 *
 * @async
 * @function getBarChartByBuilding
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string[]|string} [buildings=[]] - Lista degli edifici come array di stringhe o stringa JSON serializzata.
 * @param {string[]|string} [impianti=[]] - Lista degli impianti come array di stringhe o stringa JSON serializzata.
 * @returns {Promise<Object>} Oggetto contenente i dati del grafico:
 *   - `labels` {string[]} - Nomi degli edifici come etichette per l'asse X.
 *   - `datasets` {Object[]} - Dati dei consumi per impianto:
 *       - `label` {string} - Nome del dataset (ad esempio, "Impianto X").
 *       - `data` {number[]} - Consumi energetici associati agli edifici.
 *       - `backgroundColor` {string} - Colore casuale del dataset.
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 *
 * @throws {Error} Solleva un errore in caso di problemi con la validazione delle date o la pipeline di aggregazione.
 */

const getBarChartByBuilding = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    // // Validazione delle date
    const { start, end } = validateDateRange(startDate, endDate);

    // Gestire gli edifici e impianti, assicurandosi che siano array vuoti se non forniti
    const buildingArray = Array.isArray(buildings)
      ? buildings
      : JSON.parse(buildings || "[]");
    const impiantoArray = Array.isArray(impianti)
      ? impianti
      : JSON.parse(impianti || "[]");

    // Prepara il filtro di match per l'aggregazione
    const matchFilter = {
      datetime: { $gte: start, $lte: end }, // Filtra i documenti nel range di date
    };

    // Aggiungi i filtri per edificio e impianto, se forniti
    if (buildingArray.length > 0) {
      matchFilter.building = { $in: buildingArray }; // Filtra per edifici specifici
    }

    if (impiantoArray.length > 0) {
      matchFilter.id = { $in: impiantoArray }; // Filtra per impianti specifici
    }

    // Aggregazione dei consumi per ogni edificio e impianto
    const results = await EnergyData.aggregate([
      {
        $match: matchFilter, // Applica il filtro di date, edificio e impianto
      },
      {
        $sort: { datetime: 1 }, // Ordina per data ascendente
      },
      {
        $group: {
          _id: { building: "$building", id: "$id" }, // Raggruppa per edificio e impianto
          firstImport: { $first: "$TotWh.import" }, // Valore iniziale nel range
          lastImport: { $last: "$TotWh.import" }, // Valore finale nel range
        },
      },
      {
        $project: {
          building: "$_id.building", // Estrai il nome dell'edificio
          impianto: "$_id.id", // Estrai l'id dell'impianto
          consumption: { $abs: { $subtract: ["$lastImport", "$firstImport"] } }, // Calcola il consumo
        },
      },
    ]).exec();

    // Mappa i dati per ottenere il formato richiesto
    const buildingsList = [...new Set(results.map((item) => item.building))]; // Etichette degli edifici

    const datasets = results.reduce((acc, item) => {
      const datasetIndex = acc.findIndex(
        (dataset) => dataset.label === `Impianto ${item.impianto}`
      );

      // Se il dataset per l'impianto non esiste, lo creiamo
      if (datasetIndex === -1) {
        acc.push({
          label: `Impianto ${item.impianto}`,
          data: buildingsList.map(
            (building) => (building === item.building ? item.consumption : 0) // Associa il consumo corretto all'edificio
          ),
          backgroundColor: getRandomColor(), // Colore casuale per ogni impianto
        });
      } else {
        // Se il dataset esiste già, aggiorniamo il consumo per l'edificio corrente
        const buildingIndex = buildingsList.indexOf(item.building);
        acc[datasetIndex].data[buildingIndex] = item.consumption;
      }

      return acc;
    }, []);

    return {
      labels: buildingsList, // Le etichette degli edifici
      datasets, // I dataset dei consumi per ogni impianto
    };
  } catch (error) {
    console.error(
      "Errore nel calcolo dei consumi totali per edificio:",
      error.message
    );
    return { error: error.message };
  }
};

/**
 * Recupera le informazioni sugli impianti associati a ciascun edificio.
 *
 * Esegue un'aggregazione sui dati dei sensori per raggruppare gli impianti
 * (identificativi) per ogni edificio. Restituisce una mappa dove ogni edificio
 * è associato a un array di identificativi impianti unici.
 *
 * @async
 * @function getInfoMeters
 * @returns {Promise<Object>} - Un oggetto che mappa ogni edificio ai suoi impianti:
 *   - Chiave: {string} - Nome dell'edificio.
 *   - Valore: {string[]} - Array di identificativi impianti associati all'edificio.
 */
const getInfoMeters = async () => {
  const sensorData = await SensorInfo.aggregate([
    {
      $group: {
        _id: "$Edificio",
        identificativiImpianti: { $addToSet: "$identificativo" },
      },
    },
    { $project: { _id: 0, edificio: "$_id", identificativiImpianti: 1 } },
  ]);

  return sensorData.reduce((acc, { edificio, identificativiImpianti }) => {
    acc[edificio] = identificativiImpianti;
    return acc;
  }, {});
};

/**
 * Recupera i dati aggregati di un campo annidato specifico da una collezione di dati energetici,
 * filtrati per range temporale, edifici e impianti opzionali.
 *
 * @async
 * @function getNestedFields
 * @param {string} fieldName - Nome del campo annidato da recuperare (deve esistere nei documenti).
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string[]|string} [buildings=[]] - Lista degli edifici come array di stringhe o stringa JSON serializzata.
 * @param {string[]|string} [impianti=[]] - Lista degli impianti come array di stringhe o stringa JSON serializzata.
 * @returns {Promise<Object[]>} - Array di oggetti contenenti i dati filtrati:
 *   - `building` {string} - Nome dell'edificio.
 *   - `id` {string} - Identificativo dell'impianto.
 *   - `datetime` {Date} - Timestamp del dato.
 *   - `[fieldName]` {*} - Il valore del campo annidato specificato.
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 *
 * @throws {Error} Solleva un errore in caso di problemi con la validazione delle date o la pipeline di aggregazione
 */
const getNestedFields = async (
  fieldName,
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  // Validazione delle date
  const { start, end } = validateDateRange(startDate, endDate);

  // Gestire gli edifici e impianti, assicurandosi che siano array vuoti se non forniti
  const buildingArray = Array.isArray(buildings)
    ? buildings
    : JSON.parse(buildings || "[]");
  const impiantoArray = Array.isArray(impianti)
    ? impianti
    : JSON.parse(impianti || "[]");

  try {
    const pipeline = [
      // Filtro per data
      {
        $match: {
          datetime: { $gte: start, $lte: end },
          [fieldName]: { $exists: true }, // Verifica l'esistenza del campo specificato
        },
      },
      // Filtro opzionale per edifici
      ...(buildingArray.length >= 0
        ? [
            {
              $match: {
                building: { $in: buildingArray },
              },
            },
          ]
        : []),
      // Filtro opzionale per impianti
      ...(impiantoArray.length > 0
        ? [
            {
              $match: {
                id: { $in: impiantoArray },
              },
            },
          ]
        : []),
      // Proiezione dei campi necessari
      {
        $project: {
          _id: 0,
          building: 1,
          id: 1,
          datetime: 1,
          [fieldName]: 1,
        },
      },
      {
        $sort: { datetime: 1 },
      },
    ];

    // Esegui la pipeline di aggregazione
    const result = await EnergyData.aggregate(pipeline).exec();

    return result;
  } catch (err) {
    console.error("Errore durante l'aggregazione:", err);
    return { error: err.message };
  }
};

/**
 * Funzione per calcolare i consumi settimanali giornalieri per ogni edificio e impianto.
 *
 * @param {string} startDate - Data di inizio del periodo in formato ISO (es. "2024-01-01").
 * @param {string} endDate - Data di fine del periodo in formato ISO (es. "2024-01-07").
 * @param {Array<string>} buildings - (Opzionale) Lista di edifici da includere nei risultati.
 * @param {Array<string>} impianti - (Opzionale) Lista di impianti da includere nei risultati.
 * @returns {Promise<Object>} Un oggetto contenente i dati per costruire un grafico a barre.
 * - labels: Array con i nomi dei giorni della settimana.
 * - datasets: Array di oggetti con i consumi totali degli edifici e dei loro impianti.
 * @throws {Error} Se i parametri non sono validi o si verifica un errore nella query.
 */
const getWeeklyConsumptionByDay = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    // Validazione delle date
    const start = validateUTCDate(startDate, "startDate");
    const end = validateUTCDate(endDate, "endDate");

    if (start > end) {
      throw new Error(
        "La data di inizio deve essere antecedente alla data di fine."
      );
    }

    // Normalizzazione dei parametri buildings e impianti
    const buildingArray = parseArray(buildings, "buildings");
    const impiantoArray = parseArray(impianti, "impianti");

    // Creazione del filtro di ricerca
    const matchFilter = createMatchFilter(
      start,
      end,
      buildingArray,
      impiantoArray
    );

    // Esegui aggregazione dei dati
    const results = await fetchConsumptionData(matchFilter);
    console.log(results)
    // Costruisci i dati per il grafico
    const chartData = buildChartData(results);

    return chartData;
  } catch (error) {
    console.error(
      "Errore nel calcolo dei consumi settimanali per giorno:",
      error.message
    );
    return { error: error.message };
  }
};

/**
 * Crea il filtro di match per l'aggregazione MongoDB.
 * @param {Date} start - Data di inizio.
 * @param {Date} end - Data di fine.
 * @param {Array<string>} buildings - Array di edifici.
 * @param {Array<string>} impianti - Array di impianti.
 * @returns {Object} Filtro di match per l'aggregazione.
 */
function createMatchFilter(start, end, buildings, impianti) {
  const filter = {
    datetime: { $gte: start, $lte: end },
  };

  if (buildings.length > 0) {
    filter.building = { $in: buildings };
  }

  if (impianti.length > 0) {
    filter.id = { $in: impianti };
  }

  return filter;
}

/**
 * Esegue l'aggregazione dei dati di consumo energetico.
 * @param {Object} matchFilter - Filtro di match per MongoDB.
 * @returns {Promise<Array>} Risultati dell'aggregazione.
 */
async function fetchConsumptionData(matchFilter) {
  return await EnergyData.aggregate(
    
    /*[
    // Fase di match: filtra i documenti per l'intervallo di tempo
    {
      $match: matchFilter, // Applica i filtri per le date, edifici, ecc.
    },
    // Ordina per datetime in ordine crescente
    {
      $sort: { datetime: 1 },
    },
    // Aggiungi il giorno della settimana
    {
      $project: {
        building: 1,
        id: 1,
        TotWh: 1,
        datetime: 1,
        dayOfWeek: { $isoDayOfWeek: "$datetime" }, // Ottieni il giorno della settimana
      },
    },
    // Raggruppa per edificio, impianto e giorno della settimana
    {
      $group: {
        _id: {
          building: "$building", // Raggruppa per edificio
          id: "$id", // Raggruppa per impianto
          day: "$dayOfWeek", // Raggruppa per giorno della settimana
        },
        firstImport: { $first: "$TotWh.import" }, // Valore iniziale dell'importazione
        lastImport: { $last: "$TotWh.import" }, // Valore finale dell'importazione
      },
    },
    // Calcola il consumo per impianto per ciascun giorno della settimana
    {
      $project: {
        building: "$_id.building",
        impianto: "$_id.id",
        day: "$_id.day",
        consumption: { $abs: { $subtract: ["$lastImport", "$firstImport"] } }, // Consumo del giorno
      },
    },
    // Raggruppa i dati per edificio e giorno della settimana
    {
      $group: {
        _id: { building: "$building", day: "$day" }, // Raggruppa per edificio e giorno della settimana
        totalBuildingConsumption: { $sum: "$consumption" }, // Somma dei consumi per edificio e giorno
        impianti: {
          $push: {
            impianto: "$impianto", // Aggiungi il nome dell'impianto
            consumption: "$consumption", // Aggiungi il consumo dell'impianto
          },
        },
      },
    },
    // Ordina per edificio e giorno della settimana
    {
      $sort: { "_id.building": 1, "_id.day": 1 },
    },
    // Raggruppa i dati per edificio
    {
      $group: {
        _id: "$_id.building", // Raggruppa per edificio
        dailyConsumption: {
          $push: {
            day: "$_id.day", // Aggiungi il giorno della settimana
            totalBuildingConsumption: "$totalBuildingConsumption", // Consumo totale dell'edificio per giorno
            impianti: "$impianti", // Aggiungi i consumi per impianto
          },
        },
        totalWeeklyConsumption: {
          $sum: "$totalBuildingConsumption", // Somma dei consumi totali per la settimana per edificio
        },
      },
    },
    // Proietta i dati finali
    {
      $project: {
        building: "$_id", // Mostra il nome dell'edificio
        dailyConsumption: 1, // Mostra i consumi giornalieri per edificio
        totalWeeklyConsumption: 1, // Consumo totale della settimana per edificio
        _id: 0, // Non includere _id nel risultato finale
      },
    },
  ]*/
 [
  // 0) FILTRA
  {
    $match: {
    $and: [
      matchFilter,                     // qui il tuo oggetto di filtro
      { "TotWh.import": { $type: "number" } } // condizione aggiuntiva
    ]
  }
  },
  // 2) Campi utili: data locale, giorno della settimana, import come numero
  {
    $addFields: {
      dayKey: { $dateToString: { format: "%Y-%m-%d", date: "$datetime", timezone: "Europe/Rome" } },
      dayOfWeek: { $isoDayOfWeek: { date: "$datetime", timezone: "Europe/Rome" } },
      importNum: { $toDouble: "$TotWh.import" }
    }
  },

  // 3) Ordine cronologico per finestra
  { $sort: { building: 1, id: 1, datetime: 1 } },

  // 4) Δ tra questa lettura e la precedente dello stesso impianto nello stesso building
  {
    $setWindowFields: {
      partitionBy: { building: "$building", id: "$id" },
      sortBy: { datetime: 1 },
      output: {
        prevImport: { $shift: { output: "$importNum", by: -1 } }
      }
    }
  },

  // 5) Delta positivo; attribuito al giorno civile locale della lettura corrente
  {
    $addFields: {
      delta: {
        $cond: [
          {
            $and: [
              { $ne: ["$importNum", null] },
              { $ne: ["$prevImport", null] },
              { $gte: ["$importNum", "$prevImport"] }
            ]
          },
          { $subtract: ["$importNum", "$prevImport"] },
          0
        ]
      }
    }
  },

  // 6) Consumo giornaliero per impianto (somma dei Δ del giorno)
  {
    $group: {
      _id: { building: "$building", id: "$id", dayKey: "$dayKey" },
      dayOfWeek: { $first: "$dayOfWeek" },
      dailyConsumption: { $sum: "$delta" }
    }
  },

  // 7) Per building + giorno della settimana: lista impianti e totale edificio
  {
    $group: {
      _id: { building: "$_id.building", day: "$dayOfWeek" },
      totalBuildingConsumption: { $sum: "$dailyConsumption" },
      impianti: {
        $push: {
          impianto: "$_id.id",
          consumption: "$dailyConsumption"
        }
      }
    }
  },

  // 8) Ordina per building e giorno 1..7
  { $sort: { "_id.building": 1, "_id.day": 1 } },

  // 9) Output per building con array di giorni e totale del periodo
  {
    $group: {
      _id: "$_id.building",
      dailyConsumption: {
        $push: {
          day: "$_id.day",
          totalBuildingConsumption: "$totalBuildingConsumption",
          impianti: "$impianti"
        }
      },
      totalWeeklyConsumption: { $sum: "$totalBuildingConsumption" }
    }
  },
  {
    $project: {
      _id: 0,
      building: "$_id",
      dailyConsumption: 1,
      totalWeeklyConsumption: 1
    }
  }
]
 ).exec();
}

/**
 * Costruisce i dati per il grafico a barre.
 * @param {Array} results - I risultati dell'aggregazione.
 * @returns {Object} Dati per il grafico.
 */
function buildChartData(results) {
  const daysOfWeek = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];
  const groupedData = {};

  results.forEach((item) => {
    const { building, dailyConsumption, totalWeeklyConsumption } = item;

    // Inizializza la struttura se non esiste già
    if (!groupedData[building]) {
      groupedData[building] = {
        totalConsumption: totalWeeklyConsumption,
        dailyData: Array(7).fill(0), // Consumo totale per ogni giorno della settimana
        impianti: {},
      };
    }

    // Aggiorna il consumo totale settimanale per l'edificio
    groupedData[building].totalConsumption = totalWeeklyConsumption;

    // Aggiorna i consumi giornalieri per l'edificio
    dailyConsumption.forEach((dayData) => {
      const { day, totalBuildingConsumption } = dayData;
      groupedData[building].dailyData[day - 1] = totalBuildingConsumption;

      // Aggiorna i consumi per impianto
      dayData.impianti.forEach(({ impianto, consumption }) => {
        if (!groupedData[building].impianti[impianto]) {
          groupedData[building].impianti[impianto] = Array(7).fill(0);
        }
        groupedData[building].impianti[impianto][day - 1] = consumption;
      });
    });
  });

  // Costruzione dataset per il grafico
  const chartData = {
    labels: daysOfWeek,
    datasets: [],
  };

  Object.keys(groupedData).forEach((building) => {
    // Dataset per il totale dell'edificio
    chartData.datasets.push({
      label: `Edificio ${building} - Totale`,
      data: groupedData[building].dailyData,
      backgroundColor: "#42a5f5",
    });

    // Dataset per ciascun impianto
    Object.keys(groupedData[building].impianti).forEach((impianto) => {
      chartData.datasets.push({
        label: `Edificio ${building} - Impianto ${impianto}`,
        data: groupedData[building].impianti[impianto],
        backgroundColor: getRandomColor(), // Funzione per generare un colore casuale
      });
    });
  });

  return chartData;
}

/**
 * Calcola il consumo medio orario di energia per edificio e impianto in un intervallo di date specificato.
 *
 * Esegue un'aggregazione per ottenere il consumo orario medio per ciascun edificio e impianto,
 * raggruppando i dati per ora e calcolando le medie. I dati restituiti sono formattati per essere utilizzati in un grafico.
 *
 * @async
 * @function getHourlyAverageConsumption
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601 o accettabile da `validateDateRange`).
 * @param {string[]|string} [buildings=[]] - Lista degli edifici come array di stringhe o stringa JSON serializzata.
 * @param {string[]|string} [impianti=[]] - Lista degli impianti come array di stringhe o stringa JSON serializzata.
 * @returns {Promise<Object>} - Dati per il grafico orario:
 *   - `labels` {string[]} - Etichette orarie (ad esempio, ["0:00", "1:00", ..., "23:00"]).
 *   - `datasets` {Object[]} - Dataset per impianto:
 *       - `label` {string} - Nome del dataset (ad esempio, "Impianto X").
 *       - `data` {number[]} - Array dei consumi orari per le 24 ore (indice rappresenta l'ora).
 *       - `backgroundColor` {string} - Colore casuale per ogni impianto.
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 *
 * @throws {Error} Solleva un errore in caso di problemi con la validazione delle date o la pipeline di aggregazione.
 */
const getHourlyAverageConsumption = async (
  startDate,
  endDate,
  buildings = [],
  impianti = []
) => {
  try {
    // Validazione delle date
    const { start, end } = validateDateRange(startDate, endDate);

    // Gestire gli edifici e impianti, assicurandosi che siano array vuoti se non forniti
    const buildingArray = Array.isArray(buildings)
      ? buildings
      : JSON.parse(buildings || "[]");
    const impiantoArray = Array.isArray(impianti)
      ? impianti
      : JSON.parse(impianti || "[]");

    // Prepara il filtro di match per l'aggregazione
    const matchFilter = {
      datetime: { $gte: start, $lte: end }, // Filtra i documenti nel range di date
    };

    // Aggiungi i filtri per edificio e impianto, se forniti
    if (buildingArray.length > 0) {
      matchFilter.building = { $in: buildingArray }; // Filtra per edifici specifici
    }

    if (impiantoArray.length > 0) {
      matchFilter.id = { $in: impiantoArray }; // Filtra per impianti specifici
    }

    // Aggregazione dei consumi per ogni edificio e impianto, per ogni ora
    const results = await EnergyData.aggregate([
      {
        $match: matchFilter, // Applica il filtro di date, edificio e impianto
      },
      /*{
        $project: {
          building: 1,
          id: 1,
          TotWh: 1,
          datetime: 1,
          hour: { $hour: "$datetime" }, // Estrai l'ora dal campo datetime
        },
      },
      {
        $group: {
          _id: { building: "$building", id: "$id", hour: "$hour" }, // Raggruppa per edificio, impianto e ora
          firstImport: { $first: "$TotWh.import" }, // Valore iniziale nell'ora
          lastImport: { $last: "$TotWh.import" }, // Valore finale nell'ora
        },
      },
      {
        $project: {
          building: "$_id.building",
          impianto: "$_id.id",
          hour: "$_id.hour",
          consumption: { $abs: { $subtract: ["$lastImport", "$firstImport"] } }, // Calcola il consumo
        },
      },
      {
        $group: {
          _id: { building: "$building", hour: "$hour" }, // Raggruppa per edificio e ora
          averageConsumption: { $avg: "$consumption" }, // Calcola la media del consumo
          impianti: {
            $push: {
              impianto: "$impianto",
              consumption: "$consumption",
            },
          },
        },
      },
      {
        $project: {
          building: "$_id.building",
          hour: "$_id.hour",
          averageConsumption: 1,
          impianti: 1,
        },
      },
      {
        $sort: { hour: 1 }, // Ordina per ora crescente
      },
    ]*/
     // 2) Campi utili: import numerico + chiavi locali giorno/ora (Europe/Rome)
  // 2) Timestamp locali (Europe/Madrid) e cumulativo TotWh.import
  {
    $addFields: {
      localDay:  { $dateTrunc: { date: "$datetime", unit: "day",  timezone: "Europe/Madrid" } },
      localHour: { $dateTrunc: { date: "$datetime", unit: "hour", timezone: "Europe/Madrid" } },
      buildingSafe: { $ifNull: ["$building", "_UNKNOWN_BUILDING"] },
      idSafe:       { $ifNull: ["$id", "_UNKNOWN_DEVICE"] },
      cumWh: "$TotWh.import"
    }
  },

  // 3) Tieni solo cumulativi numerici
  { $match: { cumWh: { $type: "number" } } },

  // 4) Ultima lettura per (building, impianto, giorno, ora)
  { $sort: { buildingSafe: 1, idSafe: 1, localDay: 1, localHour: 1, datetime: -1 } },
  {
    $group: {
      _id: { b: "$buildingSafe", d: "$idSafe", day: "$localDay", hour: "$localHour" },
      building: { $first: "$buildingSafe" },
      id:       { $first: "$idSafe" },
      day:      { $first: "$localDay" },
      hour:     { $first: "$localHour" },
      cumWh:    { $first: "$cumWh" }
    }
  },

  // 5) Cumulativo dell’ora precedente (stesso building, impianto e giorno)
  {
    $setWindowFields: {
      partitionBy: { building: "$building", id: "$id", day: "$day" },
      sortBy: { hour: 1 },
      output: {
        prevCumWh: { $shift: { output: "$cumWh", by: -1 } }
      }
    }
  },

  // 6) Consumo orario = diff positiva
  {
    $addFields: {
      consWh: {
        $cond: [
          { $and: [
              { $ne: ["$prevCumWh", null] },
              { $gt: ["$cumWh", "$prevCumWh"] }
          ]},
          { $subtract: ["$cumWh", "$prevCumWh"] },
          null
        ]
      }
    }
  },
  { $match: { consWh: { $ne: null } } },

  // 7) Ora del giorno (0–23)
  {
    $addFields: {
      hourOfDay: { $hour: { date: "$hour", timezone: "Europe/Madrid" } }
    }
  },

  // 8) Media per IMPIANTO (su tutti i giorni) alla stessa ora
  {
    $group: {
      _id: { building: "$building", id: "$id", hour: "$hourOfDay" },
      avgDeviceCons: { $avg: "$consWh" },
      daysSet: { $addToSet: "$day" }
    }
  },
  {
    $project: {
      _id: 0,
      building: "$_id.building",
      hour: "$_id.hour",
      impianto: "$_id.id",
      consumption: "$avgDeviceCons",
      days: { $toDouble: { $size: "$daysSet" } }  // come nel tuo esempio (7.0)
    }
  },

  // 9) Raggruppo per BUILDING + ORA, costruisco l'array "impianti" e la media totale
  {
    $group: {
      _id: { building: "$building", hour: "$hour" },
      averageConsumption: { $avg: "$consumption" }, // media delle medie per impianto
      impianti: {
        $push: {
          impianto: "$impianto",
          consumption: "$consumption",
          days: "$days"
        }
      }
    }
  },

  // 10) Proiezione finale
  {
    $project: {
      _id: 0,
      building: "$_id.building",
      hour: "$_id.hour",
      averageConsumption: 1,
      impianti: 1
    }
  },

  // 11) Ordinamento (opzionale)
  { $sort: { building: 1, hour: 1 } }] ).exec();

    // Mappa i risultati per costruire il formato per il grafico
    const chartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Etichette per le ore
      datasets: results.reduce((acc, item) => {
        if (Array.isArray(item.impianti)) {
          item.impianti.forEach((impianto) => {
            let dataset = acc.find(
              (dataset) => dataset.label === `Impianto ${impianto.impianto}`
            );

            if (!dataset) {
              dataset = {
                label: `Impianto ${impianto.impianto}`,
                data: Array(24).fill(0), // Inizializza con 24 ore
                backgroundColor: getRandomColor(),
              };
              acc.push(dataset);
            }

            dataset.data[item.hour] = impianto.consumption || 0; // Assicurati che consumption abbia un valore
          });
        } else {
          console.warn("Nessun impianto trovato per item:", item);
        }

        return acc;
      }, []),
    };

    return chartData;
  } catch (error) {
    console.error(
      "Errore nel calcolo dei consumi medi per ora:",
      error.message
    );
    return { error: error.message };
  }
};

/**
 * Calcola il consumo medio orario e il consumo medio costante in un periodo di date specificato.
 * Restituisce i consumi medi orari raggruppati per ogni ora e il consumo medio costante (calcolato su tutto il periodo).
 *
 * @async
 * @function getHourlyAverageConsumptionTotal
 * @param {string} startDate - Data di inizio del range (in formato ISO 8601).
 * @param {string} endDate - Data di fine del range (in formato ISO 8601).
 * @param {string} [building] - Identificativo opzionale dell'edificio.
 * @returns {Promise<Object>} - Dati per il grafico orario:
 *   - `hourlyData` {Object[]} - Consumo medio orario.
 *   - `constantValue` {number} - Valore medio costante.
 *   - `error` {string} (opzionale) - Messaggio di errore in caso di problemi.
 */
const getHourlyAverageConsumptionTotal = async (
  startDate,
  endDate,
  building
) => {
  try {
    // Validazione delle date
    const { start, end } = validateDateRange(startDate, endDate);

    // Filtro per il range di date
    const matchFilter = {
      datetime: { $gte: start, $lte: end }, // Filtro per il range di date
    };

    // Aggiungi filtro opzionale sull'edificio
    if (building && building != null) {
      console.log(building);
      matchFilter["building"] = building; // Aggiungi il filtro solo se building è definito
    }
    // Aggregazione per calcolare il consumo medio orario
    const results = await EnergyData.aggregate([
      { $match: matchFilter }, // Filtro per data
      { $sort: { datetime: 1 } }, // Ordina per datetime crescente
      /*{
        $project: {
          id: 1,
          TotWh: 1,
          datetime: 1,
          hour: { $hour: "$datetime" }, // Estrai l'ora dal campo datetime
        },
      },
      {
        $group: {
          _id: { id: "$id", hour: "$hour" }, // Raggruppa per id e ora
          firstImport: { $first: "$TotWh.import" }, // Primo valore di import
          lastImport: { $last: "$TotWh.import" }, // Ultimo valore di import
        },
      },
      {
        $project: {
          hour: "$_id.hour", // Mantieni l'ora
          consumption: {
            $abs: {
              $subtract: ["$lastImport", "$firstImport"], // Calcola la differenza tra primo e ultimo valore di import
            },
          },
        },
      },
      {
        $group: {
          _id: "$hour", // Raggruppa per ora
          averageConsumption: { $avg: "$consumption" }, // Calcola la media del consumo per ora
        },
      },
      {
        $sort: { _id: 1 }, // Ordina per ora crescente
      },
      {
        $group: {
          _id: null, // Raggruppa tutto in un unico documento
          hourlyData: {
            $push: { hour: "$_id", averageConsumption: "$averageConsumption" },
          }, // Conserva i consumi medi per ogni ora
          totalConsumption: { $sum: "$averageConsumption" }, // Somma tutti i consumi orari
        },
      },
      {
        $project: {
          hourlyData: 1, // Dati per ogni ora
          constantValue: {
            $avg: "$hourlyData.averageConsumption", // Calcola il consumo medio complessivo (media di tutti i consumi orari)
          },
        },
      },*/

  // 2) Campi utili: import numerico + giorno/ora locali (Europe/Rome)
  {
    $addFields: {
      importNum: { $toDouble: "$TotWh.import" },
      dayKey: { $dateToString: { format: "%Y-%m-%d", date: "$datetime", timezone: "Europe/Rome" } },
      hourLocal: { $hour: { date: "$datetime", timezone: "Europe/Rome" } }
    }
  },

  // 3) Ordina per id e tempo per le window
  { $sort: { id: 1, datetime: 1 } },

  // 4) Δ tra letture consecutive per lo stesso impianto
  {
    $setWindowFields: {
      partitionBy: { id: "$id" },
      sortBy: { datetime: 1 },
      output: {
        prevImport: { $shift: { output: "$importNum", by: -1 } }
      }
    }
  },

  // 5) Delta positivo (ignora reset/rollback/null)
  {
    $addFields: {
      delta: {
        $cond: [
          { $and: [
            { $ne: ["$importNum", null] },
            { $ne: ["$prevImport", null] },
            { $gte: ["$importNum", "$prevImport"] }
          ]},
          { $subtract: ["$importNum", "$prevImport"] },
          0
        ]
      }
    }
  },

  // 6) Consumo per impianto *per giorno e ora locale*
  {
    $group: {
      _id: { id: "$id", dayKey: "$dayKey", hour: "$hourLocal" },
      hourlyConsumption: { $sum: "$delta" }
    }
  },

  // 7) Media oraria sul periodo (media dei consumi giornalieri per quell’ora, su tutti gli impianti)
  {
    $group: {
      _id: "$_id.hour",
      averageConsumption: { $avg: "$hourlyConsumption" }
    }
  },

  // 8) Ordina per ora
  { $sort: { "_id": 1 } },

  // 9) Confeziona output + media delle 24 ore
  {
    $group: {
      _id: null,
      hourlyData: { $push: { hour: "$_id", averageConsumption: "$averageConsumption" } }
    }
  },
  {
    $project: {
      _id: 0,
      hourlyData: 1,
      constantValue: {
        // media delle 24 medie orarie
        $avg: {
          $map: {
            input: "$hourlyData",
            as: "h",
            in: "$$h.averageConsumption"
          }
        }
      }
    }
  }
    ]).exec();

    console.log(results);

    // Prepara i dati per la risposta
    const chartData = {
      hourlyData: results[0]?.hourlyData || [], // Consumi medi orari
      constantValue: results[0]?.constantValue || 0, // Consumo medio costante
    };

    return chartData;
  } catch (error) {
    console.error("Errore nel calcolo dei consumi medi orari:", error.message);
    return { error: error.message };
  }
};

module.exports = {
  getLiveValuesByBuilding,
  getValuesByFilter,
  getLiveValues,
  getTotalConsumption,
  getTotalConsumptionByBuilding,
  getBarChartByBuilding,
  getInfoMeters,
  getNestedFields,
  getWeeklyConsumptionByDay,
  getHourlyAverageConsumption,
  getHourlyAverageConsumptionTotal,
};
