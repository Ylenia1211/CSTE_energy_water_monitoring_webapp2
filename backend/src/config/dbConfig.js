/**
 * @fileoverview
 * Questo file gestisce la connessione al database MongoDB utilizzando Mongoose.
 * La connessione viene stabilita tramite l'URI di connessione fornito come variabile d'ambiente `MONGO_URI`.
 * Se la connessione al database fallisce, viene generato un errore e il processo viene terminato.
 *
 * @module dbConfig
 */

const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Funzione asincrona per connettersi al database MongoDB.
 * Utilizza l'URI di connessione definito nella variabile d'ambiente `MONGO_URI`.
 * Se la connessione è riuscita, stampa un messaggio di successo.
 * Se la connessione fallisce, stampa l'errore e termina il processo.
 *
 * @async
 * @function connectDB
 * @throws {Error} Se la connessione al database fallisce, l'applicazione termina con errore.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    mongoose.set("debug", true); // Facoltativo: abilita il log delle query Mongoose
    console.log("Connesso al DB Mongo");
  } catch (error) {
    console.error(error.message);
    process.exit(1); // Termina il processo se la connessione fallisce
  }
};

module.exports = { connectDB };
