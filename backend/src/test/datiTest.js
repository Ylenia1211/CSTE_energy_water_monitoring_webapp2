const mongoose = require("mongoose");

// Definizione dello schema
const DatiTestEnergiaSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    TotWh: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "DatiTestEnergia",
  }
);

// Creazione del modello
const DatiTestEnergia = mongoose.model(
  "DatiTestEnergia",
  DatiTestEnergiaSchema,
  "DatiTestEnergia"
);

module.exports = DatiTestEnergia;
