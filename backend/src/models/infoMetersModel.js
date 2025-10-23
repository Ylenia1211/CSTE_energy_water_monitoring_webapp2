const mongoose = require('mongoose');

// Definisci lo schema per la collezione "info_meters"
const infoMeterSchema = new mongoose.Schema({
  Edificio: String,
  Monitorato: String,
  'Indirizzo Ed.': String,
  Impianto: String,
  'Tipologia di controllo': String,
  Riferimento: String,
  'modello energy meter': String,
  unit_id: Number,
  Note: mongoose.Schema.Types.Mixed,  // Per valori come NaN, che possono essere nulli o numerici
  identificativo: String
});

// Crea il modello con Mongoose
const SensorInfo = mongoose.model('SensorInfo', infoMeterSchema, 'info_meter'); // 'info_meters' è il nome della collezione

module.exports = SensorInfo;