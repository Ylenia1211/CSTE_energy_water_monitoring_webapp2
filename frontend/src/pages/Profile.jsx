/**
 * @namespace pages
 * @fileoverview
 * Il file contiene il componente che gestisce la visualizzazione e la modifica dei dati del profilo utente.
 * Il componente permette all'utente di visualizzare le proprie informazioni (username, email, ruolo) e modificarle,
 * inclusa la possibilità di cambiare la password. Utilizza Redux per gestire lo stato globale dell'utente.
 *
 * Quando l'utente accede alla pagina, i dati del profilo vengono recuperati dal backend tramite l'API e mostrati.
 * L'utente può modificare il proprio profilo cliccando sul pulsante di modifica, che attiva la modalità di modifica del form.
 * In questa modalità, i dati del profilo possono essere cambiati, e l'utente può salvare o annullare le modifiche.
 *
 * Se l'aggiornamento ha successo, i nuovi dati vengono salvati nel Redux e visualizzati nella pagina.
 * In caso di errore durante il recupero o l'aggiornamento del profilo, un messaggio di errore viene mostrato.
 *
 * @module Profile
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile, updateUserProfile } from "../utils/userAPI";
import { updateUser } from "../slices/userSlice"; // Importa l'azione di Redux

/**
 * Componente `Profile` che gestisce la visualizzazione e la modifica del profilo utente.
 * Recupera i dati dell'utente dal backend e consente all'utente di modificarli.
 * Gestisce anche la modalità di modifica e l'aggiornamento dei dati tramite Redux.
 *
 * @component
 * @example
 * return (
 *   <Profile />
 * )
 */
const Profile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.user); // Accedi ai dati utente dallo stato di Redux
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    currentPassword: "", // Aggiunto per la modifica della password
  });
  const privilegi = ["Utente base", "Amministratore"];
  const [error, setError] = useState(null); // Stato per gestire gli errori

  /**
   * Funzione che recupera i dati del profilo utente dal backend e li memorizza nello stato.
   * Viene eseguita una sola volta al montaggio del componente.
   *
   * @async
   * @function
   */
  useEffect(() => {
    // Recupera i dati dell'utente dal servizio e aggiorna sia lo stato locale che lo stato di Redux
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setFormData({
          username: data.username,
          email: data.email,
          password: "", // Non mostrare la password per motivi di sicurezza
          currentPassword: "", // Non mostrare la password corrente per motivi di sicurezza
        });
        dispatch(updateUser(data)); // Aggiorna lo stato globale con i dati utente
      } catch (error) {
        console.error("Errore nel recupero del profilo:", error);
        setError("Errore nel recupero dei dati del profilo."); // Mostra un errore
      }
    };

    fetchUserData();
  }, [dispatch]);

  /**
   * Funzione per gestire la modifica dei dati nel form quando l'utente inserisce nuove informazioni.
   * @param {Event} e - L'evento di modifica dell'input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Funzione che attiva o disattiva la modalità di modifica del profilo.
   */
  const handleEditToggle = () => {
    setEditing(!editing);
  };

  /**
   * Funzione che ripristina i dati del form ai dati originali e disattiva la modalità di modifica.
   */
  const handleCancel = () => {
    setFormData({
      username: userData.username,
      email: userData.email,
      password: "",
      currentPassword: "",
    });
    setEditing(false);
    setError(null); // Resetta gli errori
  };

  /**
   * Funzione che salva le modifiche apportate al profilo utente nel backend e aggiorna lo stato.
   * Invia anche la password corrente, se presente, per la verifica della modifica della password.
   * @async
   * @function
   */
  const handleSave = async () => {
    try {
      // Se la password corrente non è vuota, inviala al backend insieme ai dati da aggiornare
      const { currentPassword, password, ...updateData } = formData;

      console.log("Form data:", formData);
      if (!password) {
        delete updateData.password; // Non inviare la password se non è presente
        console.log("pass non inviata");
      } else {
        updateData.password = password;
      }
      const updatedUser = await updateUserProfile(updateData, currentPassword);
      console.log("Utente aggiornato:", updatedUser);

      // Aggiorna lo stato locale e lo stato di Redux con i nuovi dati
      setFormData({
        ...formData,
        username: updatedUser.user.username,
        email: updatedUser.user.email,
        password: "",
        currentPassword: "",
      });
      dispatch(updateUser(updatedUser.user)); // Aggiorna lo stato globale con i nuovi dati
      setEditing(false);
      setError(null); // Resetta gli errori dopo il salvataggio riuscito
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      setError("Errore nell'aggiornamento del profilo: " + error.message); // Mostra un errore
    }
  };

  /**
   * Se non sono ancora stati caricati i dati dell'utente, viene mostrato un messaggio di caricamento.
   */
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Caricamento...
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h1 className="text-3xl text-gray-800 mb-6">
        Profilo Utente
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-400 rounded">
          {error}
        </div>
      )}

      {editing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username:
            </label>
            <input
              type="text"
              name="username"
              placeholder="Nome utente"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password Corrente:
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nuova Password:
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-900  text-white rounded-md hover:bg-indigo-400  transition-colors"
            >
              Salva
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-medium text-gray-700">Username:</span>{" "}
            {userData.username}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-700">Email:</span>{" "}
            {userData.email}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-700">Ruolo:</span>{" "}
            {privilegi[userData?.privileges] || "Utente base"}
          </p>
          <button
            onClick={handleEditToggle}
            className="mt-4 px-4 py-2 bg-indigo-900  text-white rounded-md hover:bg-indigo-400 transition-colors"
          >
            Modifica
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
