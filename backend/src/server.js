/**
 * @fileoverview
 * Modulo principale per l'avvio del server e la gestione della comunicazione WebSocket.
 *
 * Questo modulo avvia un server HTTP per l'integrazione di Express con Socket.IO, gestisce la connessione
 * dei client tramite WebSocket e avvia un thread separato per il monitoraggio delle anomalie in background.
 * Quando il worker rileva anomalie, invia notifiche ai client tramite WebSocket.
 *
 * Funzionalità principali:
 * - **Connessione al database**: Si connette al database tramite la configurazione fornita in `dbConfig`.
 * - **Server HTTP**: Utilizza il modulo `http` per creare un server che integra Express e Socket.IO.
 * - **Socket.IO**: Configura la connessione WebSocket per la comunicazione in tempo reale con i client.
 * - **Monitoraggio in Worker Thread**: Avvia un worker thread (`monitorWorker.js`) per eseguire il monitoraggio delle anomalie in background.
 * - **Notifiche WebSocket**: Invia notifiche in tempo reale ai client quando vengono rilevate anomalie dal worker.
 * - **Configurazione CORS**: Imposta CORS per consentire la comunicazione tra il frontend e il server da domini specifici configurabili.
 *
 * Questo modulo funge da entry point per l'avvio dell'applicazione, gestendo la creazione del server e la gestione
 * delle comunicazioni WebSocket, oltre a delegare il monitoraggio delle anomalie al worker.
 *
 */

require("dotenv").config();
const { serverConfig, dbConfig } = require("./config");
const { Worker } = require("worker_threads");
const { createServer } = require("http"); // Necessario per Socket.IO
const { Server } = require("socket.io");
const app = require("./app"); // Importa la configurazione di Express

// Connessione al database
dbConfig.connectDB();

// Crea un server HTTP per integrare Express con Socket.IO
const server = createServer(app);

// Configura Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || "http://localhost:5173", // Configurabile tramite .env
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configura gli eventi WebSocket
io.on("connection", (socket) => {
  console.log(`Un client si è connesso: ${socket.id}`);

  // Listener opzionale per messaggi dal client
  socket.on("customEvent", (data) => {
    console.log("Ricevuto dal client:", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnesso: ${socket.id}`);
  });
});

// Avvio del monitoraggio in un worker thread
const monitorWorker = new Worker("./src/tasks/monitorWorker.js");

// Invia notifiche WebSocket ai client quando il monitor rileva anomalie
monitorWorker.on("message", (anomaly) => {
  io.emit("anomalyNotification", anomaly); // Broadcast a tutti i client
});

monitorWorker.on("error", (error) => {
  console.error("Errore nel thread del monitor:", error);
});

monitorWorker.on("exit", (code) => {
  console.log(`Il thread del monitor è terminato con codice ${code}`);
});

// Avvio del server HTTP
server.listen(serverConfig.PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${serverConfig.PORT}`);
});
