/**
 * @fileoverview
 * Questo file importa tutte le configurazioni necessarie per l'applicazione (autenticazione, server, database)
 * e le esporta come un unico modulo.
 * Le configurazioni vengono caricate dai rispettivi file di configurazione (authConfig, serverConfig, dbConfig).
 *
 * @module Configurations(index)
 */

// Importa tutte le configurazioni
const authConfig = require("./authConfig");
const serverConfig = require("./serverConfig");
const dbConfig = require("./dbConfig");

// Esporta tutte le configurazioni come un unico modulo
module.exports = {
  authConfig: authConfig, // Configurazioni relative all'autenticazione
  serverConfig: serverConfig, // Configurazioni relative al server
  dbConfig: dbConfig, // Configurazioni relative al database
};
