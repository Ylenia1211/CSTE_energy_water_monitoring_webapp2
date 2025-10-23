/**
 * @namespace utils
 * @fileoverview
 * Modulo per la gestione delle operazioni relative agli utenti.
 *
 * Questo modulo offre funzioni per:
 * - Ottenere e aggiornare il profilo dell'utente.
 * - Gestire la creazione, l'aggiornamento e l'eliminazione di utenti.
 * - Gestire il recupero e il reset della password.
 *
 * Le funzioni interagiscono con un'API di gestione utenti tramite l'istanza Axios configurata in precedenza.
 *
 * @module userAPI
 * @requires axiosInstance
 */

import axiosInstance from "./api";

const BASE_API = "/users";

/**
 * Ottiene i dati del profilo dell'utente.
 *
 * Invia una richiesta GET per recuperare il profilo dell'utente corrente.
 *
 * @function
 * @name getUserProfile
 * @returns {Promise<Object>} Una promessa che risolve con i dati del profilo utente.
 * @throws {Error} Se c'è un errore nella richiesta, viene sollevato un errore con un messaggio di errore.
 */
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/profile`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error("Errore nel recupero del profilo: " + error.message);
  }
};

/**
 * Ottiene i dati di tutti gli utenti.
 *
 * Invia una richiesta GET per recuperare i profili di tutti gli utenti.
 *
 * @function
 * @name getAllUsers
 * @returns {Promise<Array>} Una promessa che risolve con un array contenente i dati di tutti gli utenti.
 * @throws {Error} Se c'è un errore nella richiesta, viene sollevato un errore con un messaggio di errore.
 */
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API}/profiles`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error("Errore nel recupero del profilo: " + error.message);
  }
};

/**
 * Aggiorna i dati del profilo dell'utente.
 *
 * Invia una richiesta PUT per aggiornare il profilo dell'utente corrente.
 * Se viene fornita una password corrente, viene inviata insieme agli altri dati.
 *
 * @function
 * @name updateUserProfile
 * @param {Object} updateData - I dati da aggiornare (ad esempio, nome, email).
 * @param {string} [currentPassword] - La password corrente dell'utente, necessaria se si aggiorna la password.
 * @returns {Promise<Object>} Una promessa che risolve con i dati aggiornati del profilo.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const updateUserProfile = async (updateData, currentPassword) => {
  try {
    // Crea un oggetto per inviare solo i campi modificati
    const requestData = { ...updateData };

    console.log(requestData);

    // Se la password corrente è presente, includila nella richiesta
    if (currentPassword) {
      requestData.currentPassword = currentPassword;
    }

    // Esegui la chiamata al server per aggiornare i dati del profilo
    const response = await axiosInstance.put(
      `${BASE_API}/profile`,
      requestData,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // Risposta dal server con un messaggio di errore dettagliato
      throw new Error(error.response.data.message);
    } else {
      // Errore di connessione o altro errore
      throw new Error(error.message);
    }
  }
};

/**
 * Aggiorna i dettagli di un utente specifico.
 *
 * Invia una richiesta PUT per aggiornare i dettagli di un utente identificato dal `userId`.
 *
 * @function
 * @name updateUserDetails
 * @param {string} userId - L'ID dell'utente di cui aggiornare i dettagli.
 * @param {Object} updatedData - I nuovi dati da aggiornare per l'utente.
 * @returns {Promise<Object>} Una promessa che risolve con i dettagli aggiornati dell'utente.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const updateUserDetails = async (userId, updatedData) => {
  try {
    // Esegui la chiamata API PUT per aggiornare i dettagli dell'utente
    const response = await axiosInstance.put(
      `${BASE_API}/profile/${userId}`,
      updatedData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      // Risposta del server con un messaggio di errore dettagliato
      throw new Error(error.response.data.message);
    } else {
      // Errore di connessione o altro errore
      throw new Error(error.message);
    }
  }
};

/**
 * Elimina un utente specifico.
 *
 * Invia una richiesta DELETE per eliminare un utente identificato dal `userId`.
 *
 * @function
 * @name deleteUser
 * @param {string} userId - L'ID dell'utente da eliminare.
 * @returns {Promise<Object>} Una promessa che risolve con il risultato della richiesta di eliminazione.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const deleteUser = async (userId) => {
  try {
    // Esegui la chiamata API DELETE per eliminare l'utente
    const response = await axiosInstance.delete(
      `${BASE_API}/profile/${userId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      // Risposta del server con un messaggio di errore dettagliato
      throw new Error(error.response.data.message);
    } else {
      // Errore di connessione o altro errore
      throw new Error(error.message);
    }
  }
};

/**
 * Aggiunge un nuovo utente.
 *
 * Invia una richiesta POST per creare un nuovo utente con i dati forniti.
 *
 * @function
 * @name addUser
 * @param {Object} userData - I dati del nuovo utente (ad esempio, nome, email, password).
 * @returns {Promise<Object>} Una promessa che risolve con i dati del nuovo utente creato.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const addUser = async (userData) => {
  try {
    // Esegui la chiamata API POST per aggiungere un nuovo utente
    const response = await axiosInstance.post(`${BASE_API}/profile`, userData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Risposta del server con un messaggio di errore dettagliato
      throw new Error(error.response.data.message);
    } else {
      // Errore di connessione o altro errore
      throw new Error(error.message);
    }
  }
};

/**
 * Richiede il recupero della password per l'utente tramite email.
 *
 * Invia una richiesta POST per richiedere il reset della password.
 *
 * @function
 * @name requestPasswordReset
 * @param {string} email - L'email dell'utente che richiede il recupero della password.
 * @returns {Promise<Object>} Una promessa che risolve con i dati della richiesta di reset.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_API}/password-reset/request`,
      { email }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Resetta la password di un utente tramite un token di recupero.
 *
 * Invia una richiesta POST per aggiornare la password dell'utente utilizzando il token di reset.
 *
 * @function
 * @name resetPassword
 * @param {string} token - Il token di reset della password.
 * @param {string} newPassword - La nuova password dell'utente.
 * @returns {Promise<Object>} Una promessa che risolve con i dati del reset della password.
 * @throws {Error} Se la richiesta fallisce, viene sollevato un errore con un messaggio di errore.
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_API}/password-reset/reset`,
      { token, newPassword }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message);
    }
  }
};
