/**
 * @fileoverview
 * Componente per la gestione degli utenti, che consente di visualizzare, aggiungere,
 * modificare e eliminare utenti. Inoltre, il componente gestisce la visualizzazione
 * delle informazioni relative agli utenti, nonché la gestione degli errori e la
 * conferma delle azioni di eliminazione.
 *
 * @module UserManagement
 */

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  updateUserDetails,
  deleteUser,
  addUser,
} from "../utils/userAPI";
import { updateUser } from "../slices/userSlice";

/**
 * Componente che gestisce la visualizzazione, l'aggiunta, la modifica e l'eliminazione
 * degli utenti. Mostra anche un messaggio di errore se ci sono problemi con la gestione
 * degli utenti.
 *
 * @function UserManagement
 * @returns {JSX.Element} Una vista per la gestione degli utenti con modali per l'aggiunta,
 * modifica, eliminazione e conferma delle azioni.
 */
const UserManagement = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const privilegi = ["Utente base", "Amministratore"];
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    privileges: "",
    password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  /**
   * Funzione per resettare i dati del form e gli errori
   *
   * @function resetForm
   */
  const resetForm = () => {
    setFormData({ username: "", email: "", privileges: "", password: "" });
    setEditingUser(null);
    setError(null);
  };

  /**
   * Funzione per recuperare la lista degli utenti tramite API.
   *
   * @function fetchUsers
   * @async
   * @returns {Promise<void>}
   */
  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Errore nel recupero degli utenti:", error);
      setError("Errore nel recupero degli utenti. Riprova più tardi.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Funzione per gestire la modifica di un utente esistente.
   *
   * @function handleEdit
   * @param {Object} user - L'utente da modificare.
   */
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      privileges: user.privileges,
    });
    setShowModal(true);
  };

  /**
   * Funzione per gestire i cambiamenti nei campi del form.
   *
   * @function handleChange
   * @param {React.ChangeEvent} e - L'evento di cambiamento dell'input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  /**
   * Funzione per annullare una modifica o l'aggiunta di un utente.
   *
   * @function handleCancel
   */
  const handleCancel = () => {
    setShowModal(false);
    setShowAddUserModal(false);
    resetForm();
  };

  /**
   * Funzione per salvare le modifiche apportate a un utente.
   *
   * @function handleSave
   * @async
   * @throws {Error} Se l'utente non può diventare amministratore.
   */
  const handleSave = async () => {
    try {
      if (formData.privileges == "1" && currentUser.privileges != "1") {
        throw new Error(
          "Non puoi concedere il ruolo di amministratore a un altro utente."
        );
      }
      const updatedUser = await updateUserDetails(editingUser._id, formData);
      setUsers(
        users.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'utente:", error);
      setError("Errore nell'aggiornamento dell'utente: " + error.message);
    }
  };

  /**
   * Funzione per gestire l'eliminazione di un utente.
   *
   * @function handleDelete
   * @param {Object} user - L'utente da eliminare.
   */
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  /**
   * Funzione per confermare l'eliminazione di un utente.
   *
   * @function confirmDelete
   * @async
   */
  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete._id);
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      setShowConfirmDelete(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'utente:", error);
      setError("Errore nell'eliminazione dell'utente: " + error.message);
    }
  };

  /**
   * Funzione per annullare l'eliminazione di un utente.
   *
   * @function cancelDelete
   */
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  /**
   * Funzione per aggiungere un nuovo utente.
   *
   * @function handleAddUser
   * @async
   * @throws {Error} Se l'utente non può creare un amministratore.
   */
  const handleAddUser = async () => {
    try {
      if (formData.privileges == "1" && currentUser.privileges != "1") {
        throw new Error(
          "Non puoi creare un nuovo utente con il ruolo di amministratore."
        );
      }
      const newUser = await addUser(formData);
      setUsers([...users, newUser]);
      setShowAddUserModal(false);
      resetForm();
    } catch (error) {
      console.error("Errore nell'aggiunta dell'utente:", error);
      setError("Errore nell'aggiunta dell'utente: " + error.message);
    }
  };

  if (currentUser.privileges != "1") {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Accesso non autorizzato.
      </div>
    );
  }

  return (
    <div className="mt-4 max-w-6xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl mb-4"> Gestione Utenti</h1>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-start mb-4">
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded"
        >
          Aggiungi nuovo utente
        </button>
      </div>

      {/* Tabella utenti */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2 px-4">Username</th>
            <th className="border-b py-2 px-4">Email</th>
            <th className="border-b py-2 px-4">Ruolo</th>
            <th className="border-b py-2 px-4">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id || `user-${index}`}>
              <td className="border-b py-2 px-4">{user.username}</td>
              <td className="border-b py-2 px-4">{user.email}</td>
              <td className="border-b py-2 px-4">
                {privilegi[user.privileges]}
              </td>
              <td className="border-b py-2 px-4">
                <button
                  onClick={() => handleEdit(user)}
                  className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Modifica
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="ml-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale Modifica */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/4 max-w-2xl p-8 rounded shadow-lg">
            <h2 className="text-xl mb-4">Modifica Utente</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Nome utente"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Ruolo</label>
              <select
                name="privileges"
                value={formData.privileges}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="0">Utente base</option>
                <option value="1">Amministratore</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                className="ml-2 px-4 py-2 bg-yellow-500  text-white rounded hover:bg-yellow-600"
              >
                Salva modifica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Conferma Eliminazione */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/4 max-w-2xl p-8 rounded shadow-lg">
            <h2 className="text-xl mb-4">Confermi l'eliminazione?</h2>
            <p>
              Sei sicuro di voler eliminare l'utente{" "}
              <strong>{userToDelete?.username}</strong>?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Aggiungi Utente */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-3/4 max-w-2xl p-8 rounded shadow-lg">
            <h2 className="text-xl mb-4">Aggiungi Utente</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Nome utente"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Password</label>
              <input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border rounded"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Ruolo</label>
              <select
                name="privileges"
                value={formData.privileges}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="0">Utente base</option>
                <option value="1">Amministratore</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={handleAddUser}
                className="ml-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
