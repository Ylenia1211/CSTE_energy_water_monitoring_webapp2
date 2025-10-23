/**
 * @namespace pages
 * @fileoverview
 * Componente delle impostazioni dell'utente, che consente di abilitare o disabilitare le notifiche via email.
 * Il componente utilizza Redux per ottenere l'email dell'utente, interagendo con l'API per gestire l'osservazione dell'utente.
 * Se l'utente è abilitato alle notifiche via email, il componente consente di disabilitarle, e viceversa.
 * Utilizza gli hook React come `useState` e `useEffect` per gestire lo stato delle notifiche e il flusso di dati.
 * Il componente permette di gestire l'interazione con le API `addObserver`, `removeObserver` e `isUserObserving` per l'abilitazione o disabilitazione delle notifiche.
 *
 * @module Settings
 */

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  addObserver,
  removeObserver,
  isUserObserving,
} from "../utils/observerAPI"; // Importa la funzione isUserObserving

/**
 * Componente che permette all'utente di abilitare o disabilitare le notifiche via email.
 * Utilizza l'email dell'utente (recuperata dallo store Redux) per verificare lo stato di osservazione
 * e per consentire la modifica di tale stato.
 *
 * @function Settings
 * @returns {JSX.Element} Rende l'interfaccia utente delle impostazioni per le notifiche via email.
 */
const Settings = () => {
  /**
   * Stato che tiene traccia se le notifiche via email sono abilitate o meno.
   * Il valore iniziale è `null`, che rappresenta un caricamento in corso.
   * @type {boolean | null}
   */
  const [isEmailNotificationEnabled, setIsEmailNotificationEnabled] =
    useState(null);
  const userEmail = useSelector((state) => state.user.user.email);

  /**
   * Effetto per verificare se l'utente è un osservatore. Si attiva ogni volta che l'email dell'utente cambia.
   * Utilizza la funzione `isUserObserving` per determinare se l'utente riceve notifiche via email.
   *
   * @async
   * @function checkIfUserIsObserving
   * @returns {void}
   */
  useEffect(() => {
    const checkIfUserIsObserving = async () => {
      if (!userEmail) {
        console.warn("L'email dell'utente non è definita");
        setIsEmailNotificationEnabled(false); // Imposta a false se l'email non è definita
        return;
      }

      try {
        // Usa la funzione isUserObserving per verificare se l'utente è un osservatore
        const { isObserving } = await isUserObserving(userEmail);
        console.log("isObserving:", isObserving);
        setIsEmailNotificationEnabled(isObserving);
      } catch (error) {
        console.error(
          "Errore nel controllare se l'utente è un osservatore:",
          error.message
        );
        setIsEmailNotificationEnabled(false);
      }
    };

    checkIfUserIsObserving();
  }, [userEmail]);

  /**
   * Gestisce il toggle tra l'abilitazione e la disabilitazione delle notifiche via email.
   * Se le notifiche sono abilitate, rimuove l'osservazione tramite `removeObserver`; se disabilitate, le abilita
   * tramite `addObserver`.
   *
   * @async
   * @function handleToggleNotification
   * @returns {void}
   */
  const handleToggleNotification = async () => {
    if (isEmailNotificationEnabled === null) {
      console.warn(
        "Caricamento in corso, attendi che il valore sia disponibile."
      );
      return;
    }

    if (isEmailNotificationEnabled) {
      try {
        await removeObserver(userEmail);
        setIsEmailNotificationEnabled(false);
        console.log("Notifiche via email disabilitate");
      } catch (error) {
        console.error(
          "Errore nella disabilitazione delle notifiche:",
          error.message
        );
      }
    } else {
      try {
        await addObserver(userEmail);
        setIsEmailNotificationEnabled(true);
        console.log("Notifiche via email abilitate");
      } catch (error) {
        console.error(
          "Errore nell'abilitazione delle notifiche:",
          error.message
        );
      }
    }
  };

  // Mostra un messaggio di caricamento finché il valore non è stato impostato
  if (isEmailNotificationEnabled === null) {
    return <div className="p-4">Caricamento...</div>;
  }

  return (
    <div className="p-4">
      <div className="settings-page bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Impostazioni</h2>

        <div className="flex items-center justify-between mb-4">
          <span>Ricevi notifiche via email</span>
          <button
            onClick={handleToggleNotification}
            className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${
              isEmailNotificationEnabled
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isEmailNotificationEnabled ? "Disabilita" : "Abilita"}
          </button>
        </div>

        {/* Altri settaggi possono essere aggiunti qui */}
      </div>
    </div>
  );
};

export default Settings;
