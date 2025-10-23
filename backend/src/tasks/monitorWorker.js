/**
 * @namespace tasks
 * @fileoverview
 * Questo modulo permette creazione sul server di file (immagini) ricevute dal client.
 * @module monitorWorker
 */

const { sendEmail } = require("../config/emailConfig");
const { getObservers } = require("../services/observerService");
const {
  checkNoData,
  checkTotWHighAverage,
  getRecentData,
  calculateAverages,
  checkMissingSensors,
} = require("../services/anomalyService");
const Log = require("../models/logModel");
const { connectDB } = require("../config/dbConfig");
const { parentPort } = require("worker_threads");
const { logWarn } = require("../utils/logger");
const { toUTCDate } = require("../utils/utils");

/**
 *
 * @function monitor
 *
 * Funzione principale che monitora le anomalie in tempo reale.
 * Esegue il controllo periodico dei dati, rileva anomalie e invia report via email.
 *
 * Il monitoraggio viene eseguito ogni minuto, controllando i dati degli ultimi `checkTime` minuti
 * e verificando anomalie legate ai sensori, ai dati mancanti e alle medie alte di TotW.
 *
 * Il risultato viene inviato via email agli osservatori, e le anomalie vengono registrate nel database.
 */
async function monitor() {
  connectDB();
  console.log("Avvio del monitoraggio...");
  const checkTime = 2; // Controllo i dati degli ultimi checkTime minuti

  try {
    while (true) {
      const recentData = await getRecentData(checkTime);
      const averages = await calculateAverages();

      const missingSensorAnomalies = await checkMissingSensors(
        recentData,
        checkTime
      ); // Controlla i sensori mancanti
      const noDataAnomalies = await checkNoData(recentData, checkTime); // Controlla dati mancanti (null)
      const totWHighAverageAnomalies = await checkTotWHighAverage(
        recentData,
        averages
      ); // Controlla anomalie su TotW

      const allAnomalies = [
        ...missingSensorAnomalies,
        ...noDataAnomalies,
        ...totWHighAverageAnomalies,
      ];

      if (allAnomalies.length > 0) {
        console.log(`\n---------- ${new Date()} -----------\n`);

        // Inizia la struttura HTML dell'email con stili CSS
        let combinedMessage = `
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                background-color: #f4f4f4;
                                padding: 20px;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            h3 {
                                color: #555;
                            }
                            .anomaly {
                                border-bottom: 1px solid #ddd;
                                margin-bottom: 10px;
                                padding-bottom: 10px;
                            }
                            .error {
                                color: #d9534f;
                                font-weight: bold;
                            }
                            .warn {
                                color: #f0ad4e;
                                font-weight: bold;
                            }
                            .info {
                                color: #5bc0de;
                                font-weight: bold;
                            }
                            .details {
                                margin-left: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Rapporto di monitoraggio delle anomalie</h2>
                            <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
                            <h3>Dettagli delle ${
                              allAnomalies.length
                            } anomalie rilevate:</h3>
                `;

        for (const anomaly of allAnomalies) {
          // Controlla se esiste già un log con la stessa anomalia
          const existingLog = await Log.findOne({
            date: toUTCDate(anomaly.date),
            type: anomaly.type,
            message: anomaly.message,
            building: anomaly.building || "Non specificato",
            sensor: anomaly.sensor || "Non specificato",
          });

          if (!existingLog) {
            // Se l'anomalia non esiste, inserisci nel database e invia la notifica
            await Log.create({
              timestamp: toUTCDate(new Date()),
              date: toUTCDate(anomaly.date),
              type: anomaly.type,
              message: anomaly.message,
              building: anomaly.building || "Non specificato",
              sensor: anomaly.sensor || "Non specificato",
            });
            const anomalyType = anomaly.type.toLowerCase();
            let typeClass = "info";

            // Determina il colore basato sul tipo di anomalia
            if (anomalyType === "error") {
              typeClass = "error";
            } else if (anomalyType === "warn") {
              typeClass = "warn";
            }

            combinedMessage += `
                            <div class="anomaly">
                                <p class="${typeClass}">Tipo: ${
              anomaly.type
            }</p>
                                <div class="details">
                                    <p><strong>Data:</strong> ${new Date(
                                      anomaly.date
                                    ).toLocaleString()}</p>
                                    <p><strong>Messaggio:</strong> ${
                                      anomaly.message
                                    }</p>
                                    <p><strong>Edificio:</strong> ${
                                      anomaly.building || "Non specificato"
                                    }</p>
                                    <p><strong>Sensore:</strong> ${
                                      anomaly.sensor || "Non specificato"
                                    }</p>
                                </div>
                            </div>
                        `;
            console.log(anomaly.message);
            // Invia la notifica al main thread per inoltrarla ai client WebSocket
            parentPort.postMessage(anomaly);
          }
        }

        combinedMessage += `
                        </div>
                    </body>
                    </html>
                `;
        // Invia l'email solo se ci sono anomalie raccolte
        if (
          combinedMessage.trim() !==
          `
                    <html>
                    <body>
                        <h2>Rapporto di monitoraggio delle anomalie</h2>
                        <p><strong>Data:</strong> ${new Date().toISOString()}</p>
                        <h3>Dettagli delle anomalie rilevate:</h3>
                    </body>
                    </html>
                `
        ) {
          const observers = await getObservers();
          const subject = `${
            allAnomalies.length
          } anomalie rilevate (${new Date().toLocaleString()})`;
          observers.forEach(async (observer) => {
            await sendEmail(observer.email, subject, combinedMessage);
          });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 60000)); // Aspetta 1 minuto prima del prossimo controllo
    }
  } catch (error) {
    console.error("Errore nel monitoraggio:", error);
  }
}

monitor();
