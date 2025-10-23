/**
 * @namespace pages
 * @fileoverview
 * Il file `Logout.jsx` contiene un componente che gestisce il processo di logout dell'utente.
 * Quando l'utente accede a questa pagina, viene chiamata la funzione di logout dell'API,
 * che invia una richiesta al server per disconnettere l'utente. Successivamente,
 * lo stato utente viene aggiornato nel Redux e un messaggio di risposta viene mostrato all'utente.
 *
 * Se il logout ha successo, il messaggio di successo verrà visualizzato, altrimenti
 * verrà visualizzato il messaggio di errore.
 *
 * @module Logout
 */

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../slices/userSlice"; // Importa l'azione
import { logoutUser } from "../utils/authAPI";

/**
 * Componente `Logout` che gestisce il processo di logout dell'utente.
 * Quando il componente è montato, viene invocata la funzione `logoutUser` per eseguire il logout
 * dell'utente tramite una richiesta API. Una volta completato il logout, viene dispatchata l'azione `logout`
 * per aggiornare lo stato dell'utente nel Redux. Il componente visualizza un messaggio in base al risultato
 * dell'operazione.
 *
 * @component
 * @example
 * // Utilizzo del componente Logout
 * <Logout />
 *
 * @returns {React.ReactNode} - Un componente JSX che visualizza un messaggio di successo o errore
 * in base al risultato del processo di logout.
 */
function Logout() {
  const [message, setMessage] = useState(""); // Stato per memorizzare il messaggio di successo/errore
  const userDispatch = useDispatch(); // Hook per ottenere la funzione dispatch di Redux

  useEffect(() => {
    // Funzione asincrona per chiamare l'API di logout
    async function logoutAPI() {
      try {
        const response = await logoutUser(); // Chiamata API per il logout
        setMessage(response.message); // Imposta il messaggio di successo
        userDispatch(logout()); // Esegue il logout nell'applicazione Redux
      } catch (err) {
        setMessage(err.message); // Imposta il messaggio di errore in caso di fallimento
      }
    }
    logoutAPI(); // Esegui la funzione di logout quando il componente è montato
  }, [userDispatch]); // Il logout avviene solo una volta al montaggio del componente

  return <div>{message}</div>; // Rende il messaggio di successo o errore
}

export default Logout;
