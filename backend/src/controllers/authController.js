/**
 * @fileoverview
 * Questo file contiene i controller per la gestione dell'autenticazione degli utenti.
 * Gestisce le operazioni di login, registrazione e logout.
 * Per il login, un token JWT viene generato e inviato come cookie al client per essere utilizzato nelle richieste successive.
 * Il sistema supporta anche la registrazione di nuovi utenti e la gestione dei cookie di sessione per il logout.
 * @module authController
 */

const authService = require("../services/authService");

/**
 * Gestisce il login dell'utente.
 *
 * Verifica la validità di `username` e `password` passati nel corpo della richiesta, genera un token JWT
 * e lo invia come cookie di sessione al client. Restituisce inoltre i dati dell'utente e il token.
 *
 * @async
 * @function loginUser
 * @param {Object} req - L'oggetto della richiesta HTTP contenente le credenziali di login (`username` e `password`).
 * @param {Object} res - L'oggetto della risposta HTTP, utilizzato per restituire il token e i dettagli dell'utente.
 * @returns {Promise<void>} Una risposta JSON con il messaggio di successo e i dati dell'utente.
 *
 * @throws {Error} Se si verifica un errore durante la generazione del token o un problema con le credenziali,
 *                 restituisce un errore con un codice di stato 400 o 500.
 *
 * @example
 * // Richiesta POST per il login
 * POST /api/auth/login
 * {
 *   "username": "user1",
 *   "password": "password123"
 * }
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifica che l'username e la password siano passati
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username e password sono richiesti" });
    }

    // Genera il token JWT
    const token = await authService.loginUser(username, password);

    // Ottieni la data di scadenza (exp) dal payload del token
    const expirationTime = authService?.getPayload(token)?.exp;

    // Verifica se exp è definito e valida, se sì calcola il maxAge in millisecondi
    const maxAge = expirationTime
      ? expirationTime * 1000 - Date.now()
      : 3600000; // Default a 1 ora se non valido

    // Invia un cookie contenente il token al client
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
    });

    const user = {
      username,
      email: authService?.getPayload(token)?.email,
      privileges: authService?.getPayload(token)?.privileges,
    };

    // Risponde con il token e i dettagli dell'utente
    res
      .status(200)
      .json({ message: "Login effettuato con successo.", token, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Errore durante il login: " + error.message });
  }
};

/**
 * Gestisce la registrazione di un nuovo utente.
 *
 * Crea un nuovo utente nel sistema con le informazioni fornite nel corpo della richiesta
 * e restituisce una risposta con i dettagli dell'utente registrato.
 *
 * @async
 * @function registerUser
 * @param {Object} req - L'oggetto della richiesta HTTP contenente i dati di registrazione dell'utente.
 * @param {Object} res - L'oggetto della risposta HTTP, utilizzato per restituire il messaggio di successo e i dettagli dell'utente.
 * @returns {Promise<void>} Una risposta JSON con il messaggio di successo e i dati dell'utente registrato.
 *
 * @throws {Error} Se si verifica un errore durante la registrazione, restituisce un errore con un codice di stato 400.
 *
 * @example
 * // Richiesta POST per la registrazione di un utente
 * POST /api/auth/register
 * {
 *   "username": "newUser",
 *   "email": "user@example.com",
 *   "password": "password123",
 * }
 */
const registerUser = async (req, res) => {
  const { username, email, password, privilege } = req.body;

  try {
    const user = await authService.registerUser(
      username,
      email,
      password,
      privilege
    );
    res.status(201).json({
      message: "Registrazione completata con successo!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Errore nella registrazione: " + error.message });
  }
};

/**
 * Gestisce il logout dell'utente.
 *
 * Rimuove il cookie di sessione contenente il token JWT e restituisce un messaggio di successo.
 *
 * @function logoutUser
 * @param {Object} req - L'oggetto della richiesta HTTP.
 * @param {Object} res - L'oggetto della risposta HTTP, utilizzato per restituire il messaggio di successo.
 * @returns {void} Una risposta JSON con il messaggio di successo.
 *
 * @throws {Error} Se si verifica un errore durante il logout, restituisce un errore con un codice di stato 500.
 *
 * @example
 * // Richiesta POST per il logout
 * POST /api/auth/logout
 */
const logoutUser = (req, res) => {
  try {
    // Rimuove il cookie "jwt"
    res.clearCookie("jwt", {
      httpOnly: true, // Protegge il cookie da attacchi XSS
      secure: process.env.NODE_ENV === "production", // Imposta secure in produzione (HTTPS)
      sameSite: "Strict", // Limita il cookie a richieste provenienti dallo stesso dominio
    });

    return res.status(200).json({ message: "Logout effettuato con successo" });
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return res
      .status(500)
      .json({ message: "Errore durante il logout: " + error.message });
  }
};

module.exports = { loginUser, registerUser, logoutUser };
