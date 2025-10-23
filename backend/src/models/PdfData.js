const mongoose = require("mongoose");

const PdfSchema = new mongoose.Schema({
  indirizzo: String,
  totale: String,
  data: Date,
  contatore: String,
  lettura: String,
  consumo: String,
  tipo_lettura: String, 
  file_pdf: String,     
  periodo: String,      
  sub_folder: String,   
}, {
  collection: "bills_water_sintetico", // collection 
  versionKey: false,              // opzionale: rimuove "__v"
});


module.exports = mongoose.model("PdfData", PdfSchema);