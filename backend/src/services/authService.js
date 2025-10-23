/**
 * @fileoverview
 * Modulo per la gestione dell'autenticazione utente tramite JWT.
 * Include funzionalità di registrazione, login, logout e parsing dei token.
 *
 * @module authService
 */

const jwt = require("jsonwebtoken");
const {
  JWT_PRIVATE_KEY,
  JWT_EXPIRES_IN,
  JWT_ALGORITHM,
} = require("../config/authConfig");
const User = require("../models/userModel");

/**
 * Genera un token JWT per il payload fornito.
 *
 * @function generateToken
 * @param {Object} payload - Il payload da includere nel token JWT.
 * @returns {string} - Il token JWT generato.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_PRIVATE_KEY, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
  });
};

/**
 * Estrae il payload da un token JWT senza verificarlo.
 *
 * @function getPayload
 * @param {string} token - Il token JWT da decodificare.
 * @returns {Object} - Il payload decodificato.
 */
const getPayload = (token) => {
  return jwt.decode(token, { complete: true }).payload;
};

/**
 * Registra un nuovo utente nel sistema.
 *
 * @function registerUser
 * @async
 * @param {string} username - L'username dell'utente.
 * @param {string} email - L'email dell'utente.
 * @param {string} password - La password dell'utente.
 * @param {number} [privilege=0] - Il livello di privilegio dell'utente (default: 0).
 * @returns {Promise<Object>} - Il documento utente appena creato.
 *
 * @throws {Error} Se un utente con lo stesso username o email esiste già.
 */
const registerUser = async (username, email, password, privilege = 0) => {
  //Verifica se l'utente esiste già
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new Error("Utente già esistente con questa email o username.");
  }

  //Creiamo un nuovo utente
  const user = new User({
    username,
    email,
    password,
    privilege,
  });

  await user.save();

  return user;
};

/**
 * Effettua il login di un utente verificando username e password.
 * @async
 * @function loginUser
 * @param {string} username - L'username dell'utente.
 * @param {string} password - La password dell'utente.
 * @returns {Promise<string>} - Il token JWT per l'utente autenticato.
 *
 * @throws {Error} Se l'utente non esiste o la password non corrisponde.
 */
const loginUser = async (username, password) => {
  const userExists = await User.findOne({ username });
  if (!userExists) {
    throw new Error("L'utente con l'username fornito non esiste.");
  }

  const isPasswordMatch = await userExists.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error("La password non è valida.");
  }

  const token = generateToken({
    userId: userExists._id,
    username: userExists.username,
    email: userExists.email,
    privileges: userExists.privileges,
  });

  return token;
};

// Logout
const logoutUser = (req, res) => {
  //Logica per invalidare i token se necessario
};

module.exports = { registerUser, loginUser, logoutUser, getPayload };
