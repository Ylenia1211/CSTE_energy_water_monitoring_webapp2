/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `AlertNotifications`, che visualizza un elenco di notifiche
 * in tempo reale. Ogni notifica ha un tipo (ERROR, WARN, INFO, etc.) e viene visualizzata con un
 * colore di bordo e sfondo diverso in base al tipo di notifica.
 * Il componente è progettato per gestire la visualizzazione delle notifiche in modo dinamico,
 * permettendo anche di caricare ulteriori notifiche tramite un bottone "Carica altre notifiche".
 *
 * @module AlertNotifications
 */
import React, { useContext } from "react";
import { NotificationContext } from "../../context/notificationContext";

/**
 * Componente per visualizzare le notifiche.
 *
 * @component
 * @example
 * return (
 *   <AlertNotifications />
 * );
 *
 * @returns {JSX.Element} Componente React che visualizza le notifiche.
 */

const AlertNotifications = () => {
  // Carico le notifiche dal NotificationContext
  const {
    notifications,
    notificationCount,
    visibleNotifications,
    loadMoreNotifications,
  } = useContext(NotificationContext);

  /**
   * Funzione per determinare lo stile della notifica in base al tipo.
   * Il tipo di notifica determina il colore del bordo e dello sfondo.
   *
   * @param {string} type Tipo della notifica (ERROR, WARN, INFO, ecc.).
   * @returns {string} Classi CSS per lo stile della notifica.
   */
  const getNotificationStyle = (type) => {
    switch (type) {
      case "ERROR":
        return "border-red-100 bg-red-500";
      case "WARN":
        return "border-yellow-100 bg-yellow-500";
      case "INFO":
        return "border-blue-100 bg-blue-500";
      default:
        return "border-gray-100 bg-gray-700";
    }
  };

  return (
    <div className="min-h-60 max-h-60 max-w-md mx-auto overflow-y-auto">
      {visibleNotifications.length > 0 ? (
        <ul className="space-y-2">
          {visibleNotifications.map((notification, index) => (
            <li
              key={index}
              className={`p-2 rounded-md border-l-4 text-white ${getNotificationStyle(
                notification.type
              )}`}
            >
              {notification.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">Nessuna notifica</p>
      )}
    </div>
  );
};

export default AlertNotifications;
