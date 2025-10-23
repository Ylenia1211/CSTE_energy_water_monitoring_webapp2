const mongoose = require('mongoose');

// Definizione dello schema per i dati energetici
const energyDataSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    unit_id: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    rounded_datetime: {
        type: Date,
        required: true
    },
    PhV: {
        phsA: { type: Number},
        phsB: { type: Number},
        phsC: { type: Number}
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
    W: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number }
    },
    TotW: { type: Number },
    TotWh: {
        import: { type: Number },
        export: { type: Number }
    },
    TotVArh: {
        import: { type: Number },
        export: { type: Number }
    },
    TotVAh: {
        import: { type: Number },
        export: { type: Number }
    },
    VAr: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number }
    },
    VA: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number }
    },
    PF: {
        phsA: { type: Number },
        phsB: { type: Number },
        phsC: { type: Number }
    },
    frequency: { type: Number },
    Temperature: { type: Number },
    lastModified: {
        type: Date,
        default: Date.now
    }
},{ collection: 'misure_sintetiche_energia' }); //collection

// Creazione del modello Mongoose
const EnergyData = mongoose.model('EnergyData', energyDataSchema);

module.exports = EnergyData;
