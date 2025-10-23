/**
 * @fileoverview
 * Modulo principale per la configurazione e il routing dell'applicazione Express.
 *
 * Questo modulo configura il server Express, gestisce le rotte e i middleware, e definisce
 * la logica di base per l'upload e la gestione dei file statici, la sicurezza, e l'autenticazione.
 *
 * Funzionalità principali:
 * - **CORS**: Configurazione del CORS per abilitare il frontend a fare richieste dal dominio specificato.
 * - **Sicurezza**: Configurazione di Helmet per migliorare la sicurezza tramite headers.
 * - **Cookie parsing**: Uso di `cookie-parser` per il parsing dei cookie nelle richieste.
 * - **Upload di file**: Verifica e creazione della cartella per gli upload, e servizio dei file statici.
 * - **Rotte API**: Definizione delle principali rotte per gestire:
 *    - Autenticazione (`/auth`)
 *    - Gestione utenti (`/users`)
 *    - Dati energetici (`/api`)
 *    - Osservatori (`/observers`)
 *    - Log e anomalie (`/logs`)
 *    - Esportazione dati (`/export`)
 *    - File (`/files`)
 *    - Query (`/queries`)
 *
 * Questo file funge da entry point per l'applicazione, gestendo la configurazione del server,
 * l'integrazione di vari middleware e il routing delle richieste alle rispettive rotte.
 *
 * @module app
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const energyDataRoutes = require("./routes/energyDataRoutes");

const authMiddleware = require("./middlewares/authMiddleware");
const userRoutes = require("./routes/userRoutes");
const observerRoutes = require("./routes/observerRoutes");
const anomalyRoutes = require("./routes/anomalyRoute");

const exportDataRoutes = require("./routes/exportRoutes");

const fileRoutes = require("./routes/fileRoutes");
const queryRoutes = require("./routes/queryRoutes");

// Configura CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || "http://localhost:5173", // Configurabile tramite .env si deve inserire l'indirizzo del frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));



// Configura Helmet per aggiungere headers di sicurezza
app.use(helmet());

//aggiunto ***
///const { PORT } = require('./config/serverConfig');
//app.listen(PORT, () => {
//  console.log(`✅ Backend avviato su http://localhost:${PORT}`);
//});

// Configura il middleware cookie-parser
app.use(cookieParser()); // Parsea i cookies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pdfExtractionRoutes = require("./routes/pdfExtractionRoutes");
app.use("/api/pdf", pdfExtractionRoutes);

const waterConsumptionRoutes = require("./routes/waterConsumptionRoutes");
app.use("/api/consumption/water", waterConsumptionRoutes);


// Verifica se la cartella uploads esiste, altrimenti la crea
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Cartella uploads creata!");
}

const waterRoutes = require("./routes/waterRoutes");
app.use("/api/water", waterRoutes);

const waterCostRoutes = require("./routes/waterCostRoutes");
app.use("/api/watercost", waterCostRoutes);

// Servizio dei file statici per la cartella uploads
app.use("/uploads", express.static(uploadDir));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", energyDataRoutes);
app.use("/observers", observerRoutes);
app.use("/logs", anomalyRoutes);
app.use("/export", exportDataRoutes);
app.use("/files", fileRoutes);
app.use("/queries", queryRoutes);

app.get("/", (req, res) => {
  res.send("Devi loggarti! <a href='/rottaProtetta'> Pagina protetta </a>");
});

module.exports = app;
