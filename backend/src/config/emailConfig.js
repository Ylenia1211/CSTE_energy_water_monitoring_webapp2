/**
 * @fileoverview
 * Questo file gestisce l'invio di email utilizzando il modulo `nodemailer`.
 * Viene configurato un trasportatore SMTP con un account Gmail per inviare email.
 * Le credenziali dell'account (email e password) sono caricate tramite variabili d'ambiente dal file `.env`.
 * La funzione `sendEmail` invia un'email con contenuto HTML a un destinatario specificato.
 *
 * @module EmailService
 */

const nodemailer = require("nodemailer");

/**
 * Configura il trasportatore per l'invio di email tramite Gmail.
 * Utilizza il servizio Gmail con autenticazione tramite le credenziali dell'utente.
 * La configurazione del trasportatore include:
 * - Il servizio Gmail
 * - La connessione sicura (SSL) sulla porta 465
 * - Le credenziali caricate dal file `.env` (utente e password)
 */
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Connessione sicura
  auth: {
    user: process.env.EMAIL_USER, // Caricato da .env
    pass: process.env.EMAIL_PASS, // Caricato da .env
  },
});

/**
 * Invia un'email con contenuto HTML al destinatario specificato.
 *
 * @async
 * @function sendEmail
 * @param {string} to - Indirizzo email del destinatario.
 * @param {string} subject - Oggetto dell'email.
 * @param {string} body - Corpo dell'email in formato HTML.
 * @throws {Error} Se si verifica un errore durante l'invio dell'email, viene registrato un errore nella console.
 */
async function sendEmail(to, subject, body) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // L'email mittente è l'utente configurato
      to, // Destinatario dell'email
      subject, // Oggetto dell'email
      html: body, // Corpo dell'email in formato HTML
    });
    console.log(`Email inviata: ${subject}`);
  } catch (error) {
    console.error("Errore nell'invio dell'email:", error);
  }
}

module.exports = { sendEmail };
