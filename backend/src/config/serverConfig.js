/**
 * @fileoverview
 * Questo file contiene le configurazioni principali per il server, come la porta su cui ascolta
 * e l'ambiente di esecuzione (sviluppo o produzione).
 * Le variabili di configurazione sono recuperate dalle variabili d'ambiente e, in assenza,
 * vengono utilizzati dei valori di default.
 *
 * @module serverConfig
 */

module.exports = {
  // Porta su cui il server ascolterà le richieste, predefinita a 5555
  PORT: process.env.PORT_BACKEND || 5555, // Usa la porta dall'ambiente o imposta 5555 come default
  // Ambiente di esecuzione, predefinito a 'development'
  NODE_ENV: process.env.NODE_ENV || "development", // Imposta l'ambiente (development o production)
};