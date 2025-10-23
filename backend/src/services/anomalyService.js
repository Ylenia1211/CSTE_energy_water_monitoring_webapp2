/**
 * @namespace services
 * @fileoverview
 * Modulo di gestione dei dati energetici, che include funzioni per monitorare i dati,
 * calcolare medie, verificare anomalie e gestire i sensori.
 * Le funzioni interagiscono con i modelli di MongoDB per raccogliere e analizzare i dati
 * relativi al consumo energetico, alla qualità dell'energia e al monitoraggio dei sensori.
 *
 * @module EnergyDataMonitor
 */

const EnergyData = require("../models/energyDataModel");
const SensorInfo = require("../models/infoMetersModel");
const Log = require("../models/logModel");
const EnergyDataTest = require("../test/energyDataModel");
const { toUTCDate } = require("../utils/utils");

/**
 * Funzione che recupera i dati energetici più recenti in un intervallo di tempo definito (in minuti).
 *
 * @param {number} minutes - Numero di minuti da considerare per il recupero dei dati.
 * @returns {Promise<Array>} Una lista di dati energetici rilevati negli ultimi 'minutes' minuti.
 */
async function getRecentData(minutes) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  // const cutoffTime = new Date(getCurrentDateInLocalTimezone() - minutes * 60 * 1000);

  console.log(
    "Controllo anomalia su dati rilevati a partire da: ",
    cutoffTime.toLocaleString(),
    ` (${minutes} minuti fa).`
  );

  return await EnergyData.find({
    datetime: { $gte: toUTCDate(cutoffTime) },
  })
    .sort({ datetime: -1 })
    .lean();
}

/**
 * Funzione che recupera tutti i sensori monitorati dal database.
 *
 * @returns {Promise<Array>} Una lista di sensori monitorati, contenente l'identificativo e l'edificio.
 */
async function getAllMonitoredSensors() {
  const sensors = await SensorInfo.find({ Monitorato: "SI" });
  return sensors.map((sensor) => {
    return { identificativo: sensor.identificativo, building: sensor.Edificio };
  });
}

/**
 * Calcola le medie storiche di vari parametri (TotW, TotPF, TotVAr) per i sensori,
 * in un intervallo di tempo definito.
 *
 * @param {string} startDate - Data di inizio del periodo di calcolo (in formato ISO).
 * @param {string} endDate - Data di fine del periodo di calcolo (in formato ISO).
 * @returns {Promise<Object>} Un oggetto contenente le medie per ciascun sensore (TotW, TotPF, TotVAr).
 */
async function calculateAverages(startDate, endDate) {
  // Crea un oggetto di filtro
  const matchFilter = { TotW: { $exists: true } };

  // Aggiungi il filtro temporale solo se startDate e endDate sono definiti
  if (startDate && endDate) {
    matchFilter.datetime = {
      $gte: toUTCDate(new Date(startDate)),
      $lte: toUTCDate(new Date(endDate)),
    };
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $group: {
        _id: { building: "$building", id: "$id" },
        averageTotW: { $avg: "$TotW" }, // Calcolo della media di TotW
        averageTotPF: { $avg: "$PF.phsA" }, // Calcolo della media di TotPF
        averageTotVAr: { $avg: "$VAr.phsA" }, // Calcolo della media di TotVAr
      },
    },
  ];

  const result = await EnergyData.aggregate(pipeline);
  const averages = {};
  result.forEach((doc) => {
    const key = `${doc._id.building}-${doc._id.id}`;
    averages[key] = {
      TotW: doc.averageTotW,
      TotPF: doc.averageTotPF,
      TotVAr: doc.averageTotVAr,
    };
  });
  return averages;
}

/**
 * Funzione che verifica se ci sono campi mancanti o nulli nei dati dei sensori.
 *
 * @param {Array} sensorData - Dati dei sensori da verificare.
 * @param {number} threshold - Numero di minuti di soglia per il controllo.
 * @returns {Array} Una lista di anomalie trovate nei dati dei sensori.
 */
async function checkNoData(sensorData, threshold) {
  const anomalies = [];
  for (const sensor of sensorData) {
    for (const [key, value] of Object.entries(sensor)) {
      if (value == null || value == undefined) {
        anomalies.push({
          type: "ERROR",
          date: sensor.datetime,
          building: sensor.building,
          sensor: sensor.id,
          message: `Campo '${key}' è mancante o nullo nel sensore ${sensor.id} nell'edificio ${sensor.building} negli ultimi ${threshold} minuti.`,
        });
      }
    }
  }
  return anomalies;
}

/**
 * Funzione che verifica se ci sono sensori che non hanno inviato dati di recente.
 *
 * @param {Array} recentData - Dati recenti raccolti dai sensori.
 * @param {number} checkTime - Tempo di controllo (in minuti) per determinare se un sensore ha inviato dati.
 * @returns {Array} Una lista di anomalie per i sensori che non hanno inviato dati.
 */
async function checkMissingSensors(recentData, checkTime) {
  const monitoredSensors = await getAllMonitoredSensors();

  const presentSensors = new Set(recentData.map((data) => data.id));

  const missingSensors = monitoredSensors.filter(
    (sensor) => !presentSensors.has(sensor.identificativo)
  );

  const anomalies = [];
  if (missingSensors.length > 0) {
    for (const sensor of missingSensors) {
      //Un sensore potrebbe essere guasto
      anomalies.push({
        type: "ERROR",
        date: new Date(),
        building: sensor.building,
        sensor: sensor.identificativo,
        message: `Il sensore ${sensor.identificativo} non ha inviato dati negli ultimi ${checkTime} minuti.`,
      });
    }
  }
  return anomalies;
}

/**
 * Funzione che verifica se il valore di TotW supera la media storica o una soglia definita.
 *
 * @param {Array} sensorData - Dati dei sensori da controllare.
 * @param {Object} averages - Oggetto contenente le medie storiche per ciascun sensore.
 * @param {number} threshold - Soglia sopra la quale considerare il valore di TotW come anomalo.
 * @returns {Array} Una lista di anomalie per i sensori con TotW troppo alto.
 */
async function checkTotWHighAverage(sensorData, averages, threshold) {
  const anomalies = [];
  for (const sensor of sensorData) {
    const key = `${sensor.building}-${sensor.id}`;
    const average = averages[key].TotW;

    //Soglia superata
    if (threshold && sensor.TotW != null && sensor.TotW > threshold) {
      anomalies.push({
        type: "WARN",
        date: sensor.datetime,
        building: sensor.building,
        sensor: sensor.id,
        message: `Il valore ${sensor.TotW} per il sensore ${sensor.id} nell'edificio ${sensor.building} supera la soglia ${threshold}.`,
      });
    }

    //Variazione eccessiva
    if (
      average &&
      sensor.TotW != null &&
      Math.abs(sensor.TotW - average) / average > 0.2
    ) {
      // Calcolo della variazione percentuale
      const percentDeviation = (
        ((sensor.TotW - average) / average) *
        100
      ).toFixed(2);

      anomalies.push({
        type: "WARN",
        date: sensor.datetime,
        building: sensor.building,
        sensor: sensor.id,
        message: `(TotW ${
          percentDeviation > 0 ? "+" : ""
        }${percentDeviation}%) Il valore ${sensor.TotW} per il sensore ${
          sensor.id
        } nell'edificio ${
          sensor.building
        } varia troppo rispetto alla media ${average}.`,
      });
    }
  }
  return anomalies;
}

/**
 * Calcola le medie dei parametri TotW, TotPF e TotVAr per ciascun edificio e sensore.
 * Utilizza l'aggregazione MongoDB per calcolare la media dei valori in base ai gruppi di dati.
 *
 * @async
 * @function calculateAverages
 * @returns {Promise<Object>} Oggetto contenente le medie per ogni coppia edificio-sensore.
 * L'oggetto restituito avrà la forma:
 * {
 *   "building-id": { TotW: Number, TotPF: Number, TotVAr: Number }
 * }
 * @throws {Error} Se si verifica un errore durante l'aggregazione.
 */
async function calculateAverages() {
  const pipeline = [
    { $match: { TotW: { $exists: true } } },
    {
      $group: {
        _id: { building: "$building", id: "$id" },
        averageTotW: { $avg: "$TotW" },
        averageTotPF: { $avg: "$PF.phsA" }, // Calcolo della media di TotPF
        averageTotVAr: { $avg: "$VAr.phsA" }, // Calcolo della media di TotVAr
      },
    },
  ];
  const result = await EnergyData.aggregate(pipeline);
  const averages = {};
  result.forEach((doc) => {
    const key = `${doc._id.building}-${doc._id.id}`;
    averages[key] = {
      TotW: doc.averageTotW,
      TotPF: doc.averageTotPF,
      TotVAr: doc.averageTotVAr,
    };
  });
  return averages;
}

/**
 * Funzione che verifica se la media di TotPF è inferiore alla soglia di 0.9.
 *
 * @param {Array} recentData - Dati recenti raccolti dai sensori.
 * @param {Object} averages - Oggetto contenente le medie storiche per ciascun sensore.
 * @returns {Array} Una lista di anomalie per i sensori con TotPF troppo basso.
 */
async function checkLowTotPF(recentData, averages) {
  const anomalies = [];
  for (const sensor of recentData) {
    const key = `${sensor.building}-${sensor.id}`;
    const average = averages[key];
    if (average && average.TotPF < 0.9) {
      //Il valore medio di TOTPF è inferiore all soglia 0.9
      anomalies.push({
        type: "WARN",
        date: sensor.datetime,
        building: sensor.building,
        sensor: sensor.id,
        message: `La media di TotPF per il sensore ${sensor.id} nell'edificio ${sensor.building} è inferiore alla soglia di 0.9 (valore medio: ${average.TotPF}).`,
      });
    }
  }
  return anomalies;
}
/**
 * Funzione che verifica se la media di TotVAr è inferiore alla soglia di 0.9.
 *
 * @param {Array} recentData - Dati recenti raccolti dai sensori.
 * @param {Object} averages - Oggetto contenente le medie storiche per ciascun sensore.
 * @returns {Array} Una lista di anomalie per i sensori con TotVAr troppo basso.
 */
async function checkLowTotVAr(recentData, averages) {
  const anomalies = [];
  for (const sensor of recentData) {
    const key = `${sensor.building}-${sensor.id}`;
    const average = averages[key];
    if (average && average.TotVAr < 0.9) {
      //Il valore medio di TotVar è inferiore all soglia 0.9
      anomalies.push({
        type: "WARN",
        date: sensor.datetime,
        building: sensor.building,
        sensor: sensor.id,
        message: `La media di TotVAr per il sensore ${sensor.id} nell'edificio ${sensor.building} è inferiore alla soglia di 0.9 (valore medio: ${average.TotVAr}).`,
      });
    }
  }
  return anomalies;
}

/**
 * Recupera i log filtrati e paginati in base ai criteri specificati.
 * Può includere filtri per data, tipo, messaggio, edificio e sensore.
 *
 * @async
 * @function getFilteredLogs
 * @param {Object} [filters={}] - I criteri di filtro. Oggetto con proprietà opzionali:
 *   - {Date|string} startDate - La data di inizio per il filtro (formato stringa o oggetto Date).
 *   - {Date|string} endDate - La data di fine per il filtro (formato stringa o oggetto Date).
 *   - {string} type - Tipo di log da filtrare.
 *   - {string} message - Messaggio per il filtro, ricerca parziale.
 *   - {string|string[]} buildings - Un singolo edificio o una lista di edifici.
 *   - {string|string[]} sensor - Un singolo sensore o una lista di sensori.
 * @param {number} [page=1] - Il numero di pagina da recuperare (paginazione).
 * @param {number} [limit=10] - Il numero di log per pagina.
 * @returns {Promise<Object>} Oggetto contenente:
 *   - {Array} logs - Lista dei log che soddisfano i filtri e la paginazione.
 *   - {number} totalLogs - Numero totale di log che soddisfano i filtri.
 *   - {number} totalPages - Numero totale di pagine.
 *   - {number} currentPage - Numero della pagina corrente.
 * @throws {Error} Se si verifica un errore durante il filtro dei log.
 */
async function getFilteredLogs(filters = {}, page = 1, limit = 10) {
  const query = {};
  try {
    // Validazione delle date
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate
        ? toUTCDate(new Date(filters.startDate))
        : null;
      const endDate = filters.endDate
        ? toUTCDate(new Date(filters.endDate))
        : null;

      // Verifica se le date sono valide
      if (
        (startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))
      ) {
        throw new Error("Una o entrambe le date fornite non sono valide.");
      }

      if (startDate && endDate && startDate > endDate) {
        throw new Error(
          "La data di inizio deve essere antecedente alla data di fine."
        );
      }

      // Aggiunta del filtro per la data
      if (startDate) query.date = { ...query.date, $gte: startDate };
      if (endDate) query.date = { ...query.date, $lte: endDate };
    }

    // Aggiunta dei filtri opzionali
    if (filters.type) query.type = filters.type;
    if (filters.message) query.message = new RegExp(filters.message, "i"); // Regex per ricerca parziale

    if (filters.buildings) {
      if (Array.isArray(filters.buildings)) {
        query.building = { $in: filters.buildings };
      } else {
        query.building = filters.buildings; // Gestione caso non array
      }
    }

    if (filters.sensor) {
      if (Array.isArray(filters.sensor)) {
        query.sensor = { $in: filters.sensor };
      } else {
        query.sensor = filters.sensor; // Gestione caso non array
      }
    }

    // Calcola il numero totale di risultati per la paginazione
    const totalLogs = await Log.countDocuments(query);

    // Recupera i log ordinati e paginati
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      logs,
      totalLogs,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error(error.message);
    return { error: error.message };
  }
}

/**
 * Recupera tutti i log filtrati in base ai criteri specificati senza paginazione.
 * Utilizza i filtri per data, tipo di log, messaggio, edificio e sensore.
 *
 * @async
 * @function getAllFilteredLogs
 * @param {Object} [filters={}] - I criteri di filtro. Oggetto con proprietà opzionali:
 *   - {Date|string} startDate - La data di inizio per il filtro (formato stringa o oggetto Date).
 *   - {Date|string} endDate - La data di fine per il filtro (formato stringa o oggetto Date).
 *   - {string} type - Tipo di log da filtrare.
 *   - {string} message - Messaggio per il filtro, ricerca parziale.
 *   - {string|string[]} building - Un singolo edificio o una lista di edifici.
 *   - {string|string[]} impianti - Un singolo sensore o una lista di sensori.
 * @returns {Promise<Object>} Oggetto contenente:
 *   - {Array} logs - Lista dei log che soddisfano i filtri.
 * @throws {Error} Se si verifica un errore durante il recupero dei log.
 */
async function getAllFilteredLogs(filters = {}) {
  const query = {};
  try {
    // Validazione delle date
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate
        ? toUTCDate(new Date(filters.startDate))
        : null;
      const endDate = filters.endDate
        ? toUTCDate(new Date(filters.endDate))
        : null;

      // Verifica se le date sono valide
      if (
        (startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))
      ) {
        throw new Error("Una o entrambe le date fornite non sono valide.");
      }

      if (startDate && endDate && startDate > endDate) {
        throw new Error(
          "La data di inizio deve essere antecedente alla data di fine."
        );
      }

      // Aggiunta del filtro per la data
      if (startDate) query.date = { ...query.date, $gte: startDate };
      if (endDate) query.date = { ...query.date, $lte: endDate };
    }

    // Aggiunta dei filtri opzionali
    if (filters.type) query.type = filters.type;
    if (filters.message) query.message = new RegExp(filters.message, "i"); // Regex per ricerca parziale

    if (filters.building) {
      if (Array.isArray(filters.building)) {
        query.building = { $in: filters.building };
      } else {
        query.building = filters.building; // Gestione caso non array
      }
    }

    if (filters.impianti) {
      if (Array.isArray(filters.impianti)) {
        query.sensor = { $in: filters.impianti };
      } else {
        query.sensor = filters.impianti; // Gestione caso non array
      }
    }

    // Recupera i log ordinati e paginati
    const logs = await Log.find(query).sort({ timestamp: -1 });

    return {
      logs,
    };
  } catch (error) {
    console.error(error.message);
    return { error: error.message };
  }
}

module.exports = {
  checkNoData,
  checkTotWHighAverage,
  getRecentData,
  calculateAverages,
  checkMissingSensors,
  checkLowTotPF,
  checkLowTotVAr,
  getFilteredLogs,
  getAllFilteredLogs,
};
