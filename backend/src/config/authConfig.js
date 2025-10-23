/**
 * @fileoverview
 * Questo file gestisce il caricamento delle chiavi RSA utilizzate per la firma e la verifica dei JSON Web Token (JWT).
 * Le chiavi vengono lette da file locali, i cui percorsi sono definiti tramite variabili d'ambiente `JWT_PRIVATE_KEY_PATH` e `JWT_PUBLIC_KEY_PATH`.
 * Se non sono fornite, vengono utilizzate le posizioni predefinite (`./keys/private.key` e `./keys/public.pem`).
 * Se non è possibile leggere le chiavi dai file, viene generato un errore e l'applicazione termina.
 * Le configurazioni per la scadenza del token (`JWT_EXPIRES_IN`) e l'algoritmo di firma (`JWT_ALGORITHM`) sono prese dalle variabili d'ambiente, con valori predefiniti se non specificati.
 *
 * @module authConfig
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Usa la variabile d'ambiente per ottenere il percorso delle chiavi
const privateKeyPath =
  process.env.JWT_PRIVATE_KEY_PATH ||
  path.resolve(__dirname, "./keys/private.key");
const publicKeyPath =
  process.env.JWT_PUBLIC_KEY_PATH ||
  path.resolve(__dirname, "./keys/public.pem");

// Carica le chiavi RSA da file
let privateKey, publicKey;
try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
  publicKey = fs.readFileSync(publicKeyPath, "utf8");
} catch (error) {
  console.error("Errore nel leggere le chiavi: ", error);
  process.exit(1); // Termina l'applicazione in caso di errore critico
}

module.exports = {
  JWT_PRIVATE_KEY: privateKey,
  JWT_PUBLIC_KEY: publicKey,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || "RS256",
};
