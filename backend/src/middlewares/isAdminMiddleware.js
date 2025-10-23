/**
 * @fileoverview
 * Questo modulo gestisce la protezione delle rotte tramite un middleware che verifica la validità del token JWT.
 * Dopo aver verificato il token, controlla se l'utente ha il ruolo di amministratore. Se l'utente non ha il ruolo appropriato,
 * viene restituito un errore di accesso vietato.
 * Se il token è valido e l'utente è un amministratore, la richiesta prosegue verso il prossimo middleware o route handler.
 *
 * @module isAdminMiddleware
 */

const jwt = require("jsonwebtoken");
const { JWT_PUBLIC_KEY } = require("../config/authConfig");

/**
 * Middleware che verifica la validità del token JWT e controlla se l'utente ha il ruolo di amministratore.
 * Il token viene cercato nell'intestazione `Authorization` o nei cookie `jwt`. Se il token è valido e l'utente ha il ruolo di
 * amministratore, la richiesta prosegue. Altrimenti, viene restituito un errore di accesso negato.
 *
 * @function isAdminMiddleware
 * @param {Object} req - Oggetto della richiesta HTTP. Dopo la verifica del token, il middleware aggiunge i dati del payload
 * del token in `req.payload`.
 * @param {Object} res - Oggetto della risposta HTTP. Utilizzato per inviare risposte di errore se il token non è valido o se
 * l'utente non ha i privilegi richiesti.
 * @param {Function} next - Funzione che permette di passare al prossimo middleware o route handler se il token è valido
 * e l'utente è un amministratore.
 * @returns {void} - Se il token è valido e l'utente ha il ruolo di amministratore, continua l'elaborazione della richiesta;
 * altrimenti, invia una risposta di errore 401 o 403.
 * @throws {Error} - Se il token non è valido o l'utente non ha il ruolo di amministratore, restituisce un errore con codice
 * di stato 401 o 403.
 */
const isAdminMiddleware = (req, res, next) => {
  // Recupera il token dall'intestazione 'authorization' o dai cookie 'jwt'
  const token = req.headers["authorization"] || req?.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      message: "Accesso negato: Nessun token fornito.",
    });
  }

  try {
    // Rimuove la parola "Bearer" se presente nel token
    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    // Verifica e decodifica il token utilizzando la chiave pubblica
    const decoded = jwt.verify(tokenWithoutBearer, JWT_PUBLIC_KEY);

    // Aggiunge il payload decodificato alla richiesta
    req.payload = decoded;

    // Verifica se l'utente ha il ruolo di amministratore (privilegi = 1)
    if (decoded.privileges != "1") {
      // Restituisce un errore 403 se l'utente non è un amministratore
      return res.status(403).json({
        message:
          "Accesso negato: solo gli amministratori possono accedere a questa risorsa.",
      });
    }

    // Prosegue con il prossimo middleware o route handler se l'utente è un amministratore
    next();
  } catch (error) {
    console.error("Errore nella verifica del token:", error);
    return res.status(401).json({ message: "Token non valido." });
  }
};

module.exports = isAdminMiddleware;
