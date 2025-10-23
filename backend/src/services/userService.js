/**
 * Modulo che gestisce i servizi relativi agli utenti, inclusi il recupero, l'aggiornamento, l'eliminazione,
 * la creazione di nuovi utenti e la gestione del recupero della password.
 *
 * @module userService
 */

const User = require("../models/userModel");
const crypto = require("crypto");
const { sendEmail } = require("../config/emailConfig");
const bcrypt = require("bcryptjs");

/**
 * Ottiene il profilo dell'utente senza includere la password.
 *
 * @param {String} userId - L'ID dell'utente di cui recuperare il profilo.
 * @returns {Object} - L'oggetto utente senza la password.
 * @throws {Error} - Se l'utente non viene trovato o si verifica un errore nel recupero dei dati.
 */
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password"); // Escludi la password
    if (!user) {
      throw new Error("Utente non trovato");
    }
    return user;
  } catch (error) {
    throw new Error("Errore durante il recupero del profilo");
  }
};

/**
 * Aggiorna il profilo dell'utente, incluse le informazioni come email e username,
 * e verifica se la password corrente è corretta prima di aggiornare la password.
 *
 * @param {String} userId - L'ID dell'utente da aggiornare.
 * @param {Object} updateData - Oggetto contenente i dati da aggiornare.
 * @param {String} [currentPassword] - La password corrente dell'utente, necessaria per aggiornare la password.
 * @returns {Object} - L'oggetto utente aggiornato senza la password.
 * @throws {Error} - Se l'utente non viene trovato, la password corrente è errata, o non ci sono modifiche.
 */
const updateProfile = async (userId, updateData, currentPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utente non trovato");
    }

    if (updateData.password) {
      if (!currentPassword) {
        throw new Error(
          "La password corrente è necessaria per modificare la password."
        );
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new Error("La password corrente è errata.");
      }
      // Hash della nuova password prima di salvarla
      updateData.password = await bcrypt.hash(updateData.password, 10); // Applica l'hashing
    }

    const updatedFields = {};
    for (const key in updateData) {
      if (updateData[key] !== user[key] && key !== "password") {
        updatedFields[key] = updateData[key];
      }
    }

    // Se è stata cambiata la password, aggiorna anche il campo "password"
    if (updateData.password) {
      updatedFields.password = updateData.password;
    }

    if (Object.keys(updatedFields).length === 0) {
      throw new Error("Nessun cambiamento rilevato");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Ottiene tutti gli utenti, escludendo le password.
 *
 * @returns {Array} - Array contenente tutti gli utenti senza la password.
 */
const getAllUsers = async () => {
  return await User.find().select("-password");
};

/**
 * Aggiorna i dati di un utente. Questa operazione è consentita solo se l'utente che effettua la richiesta è un amministratore.
 *
 * @param {String} userId - L'ID dell'utente da aggiornare.
 * @param {Object} updateData - Oggetto contenente i dati da aggiornare.
 * @param {Object} currentUser - L'utente che sta effettuando la richiesta, usato per verificare i privilegi.
 * @returns {Object} - L'oggetto utente aggiornato senza la password.
 * @throws {Error} - Se l'utente non viene trovato, l'utente che aggiorna non è un amministratore, o non ci sono modifiche.
 */
const updateUser = async (userId, updateData, currentUser) => {
  try {
    if (currentUser.privileges != "1") {
      throw new Error(
        "Accesso negato: solo gli amministratori possono aggiornare gli utenti."
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utente non trovato");
    }

    const updatedFields = {};
    for (const key in updateData) {
      if (
        key !== "_id" &&
        key !== "password" &&
        updateData[key] !== undefined &&
        updateData[key] !== user[key]
      ) {
        updatedFields[key] = updateData[key];
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      throw new Error("Nessun cambiamento rilevato");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Elimina un utente dal database. Questa operazione è consentita solo se l'utente che effettua la richiesta è un amministratore.
 *
 * @param {String} userId - L'ID dell'utente da eliminare.
 * @param {Object} currentUser - L'utente che sta effettuando la richiesta, usato per verificare i privilegi.
 * @returns {String} - Un messaggio che indica che l'utente è stato eliminato con successo.
 * @throws {Error} - Se l'utente non viene trovato, l'utente che effettua la richiesta non è un amministratore, o se l'utente sta cercando di eliminare se stesso.
 */
const deleteUser = async (userId, currentUser) => {
  try {
    if (currentUser.privileges != "1") {
      throw new Error(
        "Accesso negato: solo gli amministratori possono eliminare gli utenti."
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utente non trovato");
    }

    if (userId === currentUser.id) {
      throw new Error("Non puoi eliminare il tuo stesso account");
    }

    await User.findByIdAndDelete(userId);

    return "Utente eliminato con successo";
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Aggiunge un nuovo utente al database. Questa operazione è consentita solo se l'utente che effettua la richiesta è un amministratore.
 *
 * @param {Object} newUser - Oggetto contenente i dati del nuovo utente (email, username, password, privilegi).
 * @param {Object} currentUser - L'utente che sta effettuando la richiesta, usato per verificare i privilegi.
 * @returns {Object} - L'oggetto utente creato, senza la password.
 * @throws {Error} - Se l'utente che effettua la richiesta non è un amministratore, o se la email o lo username sono già registrati.
 */
const addUser = async (newUser, currentUser) => {
  try {
    if (currentUser.privileges != "1") {
      throw new Error(
        "Accesso negato: solo gli amministratori possono aggiungere nuovi utenti."
      );
    }

    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
      throw new Error("Email già registrata.");
    }

    const existingUsername = await User.findOne({ username: newUser.username });
    if (existingUsername) {
      throw new Error("Username già registrato.");
    }

    const createdUser = new User({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      privileges: newUser.privileges || "0",
    });

    await createdUser.save();

    return {
      _id: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
      privileges: createdUser.privileges,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Genera un token per il reset della password e lo associa all'utente.
 *
 * @param {String} email - L'email dell'utente che ha richiesto il reset della password.
 * @returns {Object} - Un oggetto contenente il token generato e l'email dell'utente.
 * @throws {Error} - Se l'utente non viene trovato.
 */
const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Utente non trovato.");

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 ora
  await user.save();

  return { token, email: user.email };
};

/**
 * Invia un'email all'utente con il link per il reset della password.
 *
 * @param {String} email - L'email dell'utente a cui inviare il link di reset della password.
 * @param {String} token - Il token per il reset della password.
 * @throws {Error} - Se si verifica un errore nell'invio dell'email.
 */
const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.ALLOWED_ORIGINS}/reset-password/${token}`;
  const message = `
  <p>
    Gentile utente,</p><p>
    Abbiamo ricevuto una richiesta di ripristino della tua password. 
    Clicca sul link qui sotto per creare una nuova password:</p>
  <p>
    <a href="${resetLink}">Ripristina Password</a>
  </p>
  <p>
    Se non hai richiesto questa modifica, ignora questa email. 
    Il link scadrà automaticamente dopo 1 ora.
  </p>
  `;

  await sendEmail(email, "Recupero password", message);
};

/**
 * Resetta la password dell'utente utilizzando il token di reset.
 *
 * @param {String} token - Il token di reset della password.
 * @param {String} newPassword - La nuova password da impostare.
 * @returns {Object} - L'utente con la password aggiornata.
 * @throws {Error} - Se il token non è valido o è scaduto.
 */
const resetPasswordWithToken = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token non valido o scaduto.");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  addUser,
  generateResetToken,
  sendResetEmail,
  resetPasswordWithToken,
};
