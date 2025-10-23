const mongoose = require('mongoose');

// Definizione dello schema per la collezione di esempio
const energyDataTestSchema = new mongoose.Schema({
    id: { type: String, required: true },
    unit_id: { type: String, required: true },
    model: { type: String, required: true },
    building: { type: String, required: true },
    datetime: { type: Date, required: true },
    rounded_datetime: { type: Date, required: true },
    PhV: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number }
    },
    V12: { type: Number },
    V23: { type: Number },
    V31: { type: Number },
    Vllavg: { type: Number },
    Vlnavg: { type: Number },
    A: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number },
        neut: { type: Number },
        avg: { type: Number }
    },
    TotW: { type: Number },
    frequency: { type: Number },
    lastModified: { type: Date, default: Date.now }
}, { collection: 'EnergyData_Test' }); // Nome della collezione di test

// Creazione del modello
const EnergyDataTest = mongoose.model('EnergyDataTest', energyDataTestSchema);

module.exports = EnergyDataTest;
