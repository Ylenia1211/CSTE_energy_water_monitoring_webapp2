/**
 * @fileoverview
 * Controller per le richieste HTTP relativi alla gestion degli utenti nel sistema.
 *
 * Questo modulo gestisce tutte le operazioni relative agli utenti, come la visualizzazione, l'aggiornamento,
 * la creazione, la cancellazione, e la gestione delle password. Ogni funzione di questo controller interagisce
 * con il servizio `userService` per eseguire la logica di business e restituisce le risposte appropriate.
 *
 * @module userController
 */

const userService = require("../services/userService");

/**
 * Controller per ottenere i dati del profilo dell'utente.
 *
 * Questa funzione recupera le informazioni relative all'utente autenticato.
 * Il `userId` viene estratto dal `payload` dell'autenticazione (middleware `authMiddleware`).
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene i dati dell'utente tramite il middleware di autenticazione.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce i dati del profilo dell'utente.
 * @throws {Error} Se si verifica un errore durante il recupero dei dati del profilo.
 * @returns {Promise<void>} Restituisce una risposta JSON con i dati dell'utente.
 */
const getProfile = async (req, res) => {
  try {
    const userId = req?.payload?.userId; //Viene passato direttamente dal authMiddleware
    const user = await userService.getProfile(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller per aggiornare il profilo dell'utente.
 *
 * Questa funzione permette di aggiornare il profilo dell'utente, comprese le modifiche alla password.
 * L'ID dell'utente è estratto dal `payload` dell'autenticazione (middleware `authMiddleware`).
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene i dati da aggiornare nel corpo della richiesta.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce un messaggio di successo con i dati aggiornati.
 * @throws {Error} Se si verifica un errore durante l'aggiornamento dei dati dell'utente.
 * @returns {Promise<void>} Restituisce una risposta JSON con un messaggio di successo e i dati aggiornati dell'utente.
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req?.payload?.userId;
    const { currentPassword, ...updateData } = req.body;

    // Passa i dati al service per l'aggiornamento
    const updatedUser = await userService.updateProfile(
      userId,
      updateData,
      currentPassword
    );

    res
      .status(200)
      .json({ message: "Profilo aggiornato con successo", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller per ottenere tutti gli utenti nel sistema.
 *
 * Questa funzione recupera una lista di tutti gli utenti registrati nel sistema.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce la lista di utenti.
 * @throws {Error} Se si verifica un errore durante il recupero degli utenti.
 * @returns {Promise<void>} Restituisce una risposta JSON con la lista di tutti gli utenti.
 */
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userService.getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero degli utenti" });
  }
};

/**
 * Controller per aggiornare un utente specifico.
 *
 * Questa funzione permette di aggiornare i dettagli di un utente specifico, identificato tramite `userId`.
 * Il `currentUser` è l'utente attualmente autenticato e può essere utilizzato per validare i permessi.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene l'ID dell'utente da aggiornare nei parametri URL e i nuovi dati nel corpo della richiesta.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce l'utente aggiornato.
 * @throws {Error} Se si verifica un errore durante l'aggiornamento dell'utente.
 * @returns {Promise<void>} Restituisce una risposta JSON con i dati dell'utente aggiornati.
 */
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  const currentUser = req.payload; // Dati dell'utente attualmente autenticato, per doppio controllo, non necessario

  console.log(updateData);

  try {
    const updatedUser = await userService.updateUser(
      userId,
      updateData,
      currentUser
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller per eliminare un utente.
 *
 * Questa funzione permette di eliminare un utente dal sistema identificato tramite `userId`.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene l'ID dell'utente da eliminare nei parametri URL.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce un messaggio di successo.
 * @throws {Error} Se si verifica un errore durante l'eliminazione dell'utente.
 * @returns {Promise<void>} Restituisce una risposta JSON con un messaggio di successo.
 */
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.payload; // Dati dell'utente attualmente autenticato

  try {
    const result = await userService.deleteUser(userId, currentUser);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller per aggiungere un nuovo utente.
 *
 * Questa funzione consente di creare un nuovo utente nel sistema. I dati dell'utente sono passati nel corpo della richiesta.
 * Il `currentUser` è l'utente che sta eseguendo la creazione e può essere utilizzato per validare i permessi.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene i dati del nuovo utente nel corpo della richiesta.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce i dati dell'utente appena creato.
 * @throws {Error} Se si verifica un errore durante la creazione dell'utente.
 * @returns {Promise<void>} Restituisce una risposta JSON con i dati dell'utente appena creato.
 */
const addUser = async (req, res) => {
  const newUser = req.body; // I dettagli del nuovo utente
  const currentUser = req.payload; // Informazioni sull'utente autenticato

  try {
    const createdUser = await userService.addUser(newUser, currentUser);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller per richiedere il recupero della password.
 *
 * Questa funzione invia una email di recupero password all'utente, contenente un link per il reset.
 * Il link è valido solo per un periodo di tempo limitato.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene l'email dell'utente che richiede il recupero.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce un messaggio di successo.
 * @throws {Error} Se si verifica un errore durante il recupero della password.
 * @returns {Promise<void>} Restituisce una risposta JSON con un messaggio di successo.
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "L'email è richiesta." });

    const { token, email: userEmail } = await userService.generateResetToken(
      email
    );
    await userService.sendResetEmail(userEmail, token);

    res
      .status(200)
      .json({ message: "Email di recupero inviata con successo." });
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero della password: " + error.message,
    });
  }
};

/**
 * Controller per resettare la password tramite un token di recupero.
 *
 * Questa funzione consente di aggiornare la password dell'utente utilizzando un token di reset.
 * Il token viene inviato tramite email al momento della richiesta di recupero password.
 *
 * @async
 * @function
 * @param {Object} req - L'oggetto della richiesta HTTP, contiene il token di recupero e la nuova password nel corpo della richiesta.
 * @param {Object} res - L'oggetto della risposta HTTP, restituisce un messaggio di successo.
 * @throws {Error} Se si verifica un errore durante il reset della password.
 * @returns {Promise<void>} Restituisce una risposta JSON con un messaggio di successo.
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token e nuova password sono richiesti." });

    await userService.resetPasswordWithToken(token, newPassword);
    res.status(200).json({ message: "Password aggiornata con successo." });
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il reset della password: " + error.message,
    });
  }
};

module.exports = {
  updateProfile,
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  addUser,
  requestPasswordReset,
  resetPassword,
};
