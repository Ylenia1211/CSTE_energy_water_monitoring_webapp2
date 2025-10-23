/**
 * @namespace utils
 * @fileoverview
 * Modulo per la gestione delle connessioni WebSocket utilizzando Socket.IO.
 *
 * Questo modulo si occupa di stabilire la connessione con il server WebSocket, impostare
 * i listener per gli eventi e fornire una funzione per rimuovere i listener quando non
 * più necessari.
 *
 * Le notifiche di anomalie vengono ascoltate e inviate tramite WebSocket.
 *
 * @module socketAPI
 * @requires socket.io-client
 */

import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_WEB_SOCKET_URL || "http://localhost:5555",
  {
    transports: ["websocket"], // Usa solo WebSocket
    withCredentials: true, // Per supportare cookie e autenticazione
  }
);

let isListenerSet = false; // Flag per controllare se il listener è già stato impostato

/**
 * Imposta il listener per le notifiche di anomalie.
 *
 * Questa funzione si occupa di ascoltare le notifiche di anomalie dal server
 * WebSocket. Quando una notifica di anomalia viene ricevuta, il callback
 * `onNotification` viene chiamato con il dato della notifica.
 *
 * Il listener è impostato solo una volta, grazie al flag `isListenerSet`.
 *
 * @function
 * @name setupSocketListeners
 * @param {function} onNotification - La funzione callback che verrà chiamata quando
 *                                    una notifica di anomalia viene ricevuta.
 * @returns {function} Una funzione di cleanup che può essere utilizzata per rimuovere
 *                     il listener quando non è più necessario.
 * @throws {Error} Se il server WebSocket non è disponibile, verrà lanciato un errore.
 */
export const setupSocketListeners = (onNotification) => {
  if (!isListenerSet) {
    socket.on("anomalyNotification", (notification) => {
      if (onNotification) {
        // console.log("Notifica di anomalia ricevuta:", notification);
        onNotification(notification);
      }
    });
    isListenerSet = true; // Imposta il flag per indicare che il listener è stato impostato
  }

  // Funzione di cleanup per rimuovere il listener quando il componente si smonta
  return () => {
    socket.off("anomalyNotification");
    isListenerSet = false; // Resetta il flag quando il listener viene rimosso
  };
};

export default socket;
