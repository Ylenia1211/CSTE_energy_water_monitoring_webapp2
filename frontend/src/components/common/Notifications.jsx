/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `Notifications`, che visualizza una lista di notifiche.
 * Se non ci sono notifiche, viene mostrato un messaggio che indica che non ci sono notifiche.
 * Il componente riceve le notifiche come prop e le rende in una lista, visualizzando il messaggio
 * di ciascuna notifica.
 *
 * @module Notifications
 */

import React from "react";

/**
 * Componente che visualizza una lista di notifiche. Ogni notifica viene rappresentata dal suo messaggio.
 * Se non ci sono notifiche, viene mostrato un messaggio che informa l'utente che non ci sono notifiche.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <Notifications notifications={notificationsData} />
 *
 * @param {Object[]} notifications - L'array di notifiche da visualizzare. Ogni notifica deve avere almeno un campo `message`.
 * @param {string} notifications.message - Il messaggio di ciascuna notifica.
 *
 * @returns {JSX.Element} Un elenco di notifiche o un messaggio che indica che non ci sono notifiche.
 */
const Notifications = ({ notifications }) => {
  if (notifications.length === 0) {
    return <div className="p-2 text-center">Nessuna notifica</div>;
  }

  return (
    <div>
      {notifications.map((notification, index) => (
        <div key={index} className="p-2">
          {notification.message}{" "}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
