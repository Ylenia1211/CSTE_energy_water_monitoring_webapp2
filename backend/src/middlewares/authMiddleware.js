/**
 * @fileoverview
 * Questo modulo gestisce la protezione delle rotte tramite un middleware che verifica la validità del token JWT presente nell'intestazione della richiesta o nei cookie.
 * Se il token è valido, il middleware aggiunge i dati decodificati del token alla richiesta. Altrimenti, restituisce un errore di accesso negato.
 *
 * @module authMiddleware
 */

const jwt = require("jsonwebtoken");
const { JWT_PUBLIC_KEY } = require("../config/authConfig");

/**
 * Middleware che verifica la validità del token JWT per proteggere le rotte.
 * Il token viene cercato nell'intestazione della richiesta (authorization) o nei cookie (jwt).
 * Se il token è valido, il middleware decodifica il payload e lo aggiunge alla richiesta.
 * Se il token non è presente o non è valido, restituisce un errore 401 (Unauthorized).
 *
 * @function authMiddleware
 * @param {Object} req - Oggetto della richiesta HTTP. Il middleware aggiunge i dati del payload decodificato del token in `req.payload`.
 * @param {Object} res - Oggetto della risposta HTTP. Utilizzato per inviare risposte di errore o proseguire con la richiesta.
 * @param {Function} next - Funzione che permette di passare al prossimo middleware o route handler se il token è valido.
 * @returns {void} - Se il token è valido, continua l'elaborazione della richiesta; altrimenti, invia una risposta di errore 401.
 * @throws {Error} - Se il token non è valido o assente, restituisce un errore 401 (Unauthorized).
 */
const authMiddleware = (req, res, next) => {
  // Recupera il token dall'intestazione 'authorization' o dai cookie 'jwt'
  const token = req.headers["authorization"] || req?.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      message: "Accesso negato: Nessun Token fornito.",
    });
  } else {
    try {
      // Rimuove la parola "Bearer" dal token se presente nell'intestazione
      const tokenWithoutBearer = token.replace(/^Bearer\s/, "");

      // Verifica e decodifica il token utilizzando la chiave pubblica
      const decoded = jwt.verify(tokenWithoutBearer, JWT_PUBLIC_KEY);

      // Aggiunge il payload decodificato alla richiesta
      req.payload = decoded;

      // Prosegue con il prossimo middleware o route handler
      next();
    } catch (error) {
      console.error("Errore nella verifica del token: ", error);
      return res.status(401).json({ message: "Token non valido." });
    }
  }
};

module.exports = authMiddleware;
