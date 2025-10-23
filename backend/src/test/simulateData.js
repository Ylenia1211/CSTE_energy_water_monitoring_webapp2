//Aggiunge documenti randomici ogni minuto (60000ms)
const mongoose = require('mongoose');
require('dotenv').config();

// Importa i modelli Mongoose
const EnergyDataTest = require('./energyDataModel'); // Modello per i dati energetici
const SensorInfo = require('../models/infoMetersModel'); // Modello per l'informazione dei sensori

// Costanti di configurazione
const VALID_PERCENTAGE = 95; // Percentuale di documenti buoni
const MISSING_DATA_PERCENTAGE = 2.5; // Percentuale di documenti con campi nulli
const ANOMALY_PERCENTAGE = 2.5; // Percentuale di documenti con anomalie
const SENSOR_MISSING_PERCENTAGE = 0; // Percentuale di sensori mancanti (max 25)
const GENERATE_DATA_TIME_MINUTES = 0.5 ;
 
// Funzione per generare dati randomici in un intervallo
function getRandomValue(min, max) {
    return (Math.random() * (max - min)) + min;
}

async function generateData(timestamp) {
    let sensors = await SensorInfo.find({ Monitorato: "SI" });

    // Simula la mancanza di sensori in base alla percentuale definita
    const numSensorsToRemove = Math.floor((SENSOR_MISSING_PERCENTAGE / 100) * sensors.length);
    sensors = sensors.slice(0, sensors.length - numSensorsToRemove); // Rimuove una parte dei sensori

    const dataToInsert = [];

    for (let i = 0; i < sensors.length; i++) {
        const sensor = sensors[i];

        // Verifica se i campi richiesti sono definiti
        if (!sensor.unit_id) {
            console.warn(`Il sensore con ID ${sensor.identificativo} non ha unit_id. Documento non aggiunto.`);
            continue;
        }

        // Determina il tipo di documento (valido, anomalo o con campi mancanti)
        const randomValue = Math.random() * 100;
        const document = {
            id: sensor.identificativo,
            unit_id: sensor.unit_id,
            model: sensor['modello energy meter'],
            building: sensor.Edificio,
            datetime: timestamp,
            rounded_datetime: new Date(Math.floor(timestamp.getTime() / 60000) * 60000),
        };

        if (randomValue < VALID_PERCENTAGE) {
            // Documento valido: tutti i campi sono valorizzati con valori randomici
            document.TotW = getRandomValue(10, 100); // Valore normale
            document.PF = { phsA: getRandomValue(0.85, 1), phsB: getRandomValue(0.85, 1), phsC: getRandomValue(0.85, 1) }; // Valori normali
            document.VAr = { phsA: getRandomValue(1, 15), phsB: getRandomValue(1, 15), phsC: getRandomValue(1, 15) }; // Valori normali

            document.PhV = {
                phsA: getRandomValue(230, 250),
                phsB: getRandomValue(230, 250),
                phsC: getRandomValue(230, 250),
            };
            document.A = {
                phsA: getRandomValue(5, 15),
                phsB: getRandomValue(5, 15),
                phsC: getRandomValue(5, 15),
                neut: getRandomValue(2, 8),
                avg: getRandomValue(5, 10),
            };
            document.W = {
                phsA: getRandomValue(1, 10),
                phsB: getRandomValue(1, 10),
                phsC: getRandomValue(1, 10),
            };
            document.TotWh = {
                import: getRandomValue(1, 100),
                export: getRandomValue(1, 100),
            };
            document.TotVArh = {
                import: getRandomValue(1, 100),
                export: getRandomValue(1, 100),
            };
            document.TotVAh = {
                import: getRandomValue(1, 100),
                export: getRandomValue(1, 100),
            };
            document.VA = {
                phsA: getRandomValue(1, 10),
                phsB: getRandomValue(1, 10),
                phsC: getRandomValue(1, 10),
            };
        } else if (randomValue < VALID_PERCENTAGE + MISSING_DATA_PERCENTAGE) {
            // Documento con campi mancanti
            document.TotW = null;
            if (Math.random() < 0.5) document.PF = { phsA: null, phsB: null, phsC: null };
            if (Math.random() < 0.5) document.VAr = { phsA: null, phsB: null, phsC: null };
            if (Math.random() < 0.5) document.PhV = { phsA: null, phsB: null, phsC: null };
            if (Math.random() < 0.5) document.A = { phsA: null, phsB: null, phsC: null, neut: null, avg: null };
            if (Math.random() < 0.5) document.W = { phsA: null, phsB: null, phsC: null };
            if (Math.random() < 0.5) document.TotWh = { import: null, export: null };
            if (Math.random() < 0.5) document.TotVArh = { import: null, export: null };
            if (Math.random() < 0.5) document.TotVAh = { import: null, export: null };
            if (Math.random() < 0.5) document.VA = { phsA: null, phsB: null, phsC: null };
        } else {
            // Documento anomalo
            document.TotW = getRandomValue(150, 200); // Valore anomalo
            document.PF = { phsA: getRandomValue(0.5, 0.85), phsB: getRandomValue(0.5, 0.85), phsC: getRandomValue(0.5, 0.85) }; // Valori anomali
            document.VAr = { phsA: getRandomValue(20, 50), phsB: getRandomValue(20, 50), phsC: getRandomValue(20, 50) }; // Valori anomali

            document.PhV = {
                phsA: getRandomValue(230, 250),
                phsB: getRandomValue(230, 250),
                phsC: getRandomValue(230, 250),
            };
            document.A = {
                phsA: getRandomValue(5, 15),
                phsB: getRandomValue(5, 15),
                phsC: getRandomValue(5, 15),
                neut: getRandomValue(2, 8),
                avg: getRandomValue(5, 10),
            };
            document.W = {
                phsA: getRandomValue(1, 15),
                phsB: getRandomValue(1, 15),
                phsC: getRandomValue(1, 15),
            };
            document.TotWh = {
                import: getRandomValue(1, 150),
                export: getRandomValue(1, 150),
            };
            document.TotVArh = {
                import: getRandomValue(1, 150),
                export: getRandomValue(1, 150),
            };
            document.TotVAh = {
                import: getRandomValue(1, 150),
                export: getRandomValue(1, 150),
            };
            document.VA = {
                phsA: getRandomValue(1, 15),
                phsB: getRandomValue(1, 15),
                phsC: getRandomValue(1, 15),
            };
        }

        document.frequency = getRandomValue(48, 52); // Frequenza leggermente variabile
        document.lastModified = new Date();

        dataToInsert.push(document);
    }

    // Inserisci i dati nella collezione di test
    await EnergyDataTest.insertMany(dataToInsert);
    console.log(`${dataToInsert.length} documenti simulati inseriti nella collezione di test.`);
}

async function main() {

    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sensor_db");
        console.log('Connesso a MongoDB');

        // Simula la generazione di nuovi dati ogni 2 minuti
        setInterval(async () => {
            const timestamp = new Date();
            await generateData(timestamp);
        }, GENERATE_DATA_TIME_MINUTES * 60 * 1000);

    } catch (err) {
        console.error('Errore durante la simulazione:', err);
    }
}

// Avvia la simulazione
main();
