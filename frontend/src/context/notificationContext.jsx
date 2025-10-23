/**
 * @fileoverview
 * @namespace context
 * Questo file contiene il contesto e i metodi associati per la gestione delle notifiche nell'applicazione.
 * Il `NotificationContext` fornisce uno stato centrale per le notifiche e consente ai componenti di interagire
 * con le notifiche in tempo reale. Viene utilizzato un socket per ascoltare gli aggiornamenti in tempo reale delle notifiche.
 *
 * @module NotificationContext
 */

import React, { createContext, useState, useEffect } from "react";
import { setupSocketListeners } from "../utils/socket";

/**
 * Crea un contesto per le notifiche.
 * Il contesto è utilizzato per fornire e gestire lo stato delle notifiche e il conteggio delle notifiche non lette.
 *
 * @constant
 * @type {React.Context}
 */
export const NotificationContext = createContext();

/**
 * Componente provider per il contesto delle notifiche.
 *
 * Fornisce lo stato delle notifiche, il conteggio delle notifiche non lette, e le funzioni per caricare e leggere
 * le notifiche a tutti i componenti discendenti.
 * I socket vengono utilizzati per ricevere le notifiche in tempo reale e aggiornare lo stato.
 *
 * @component
 *
 * @param {ReactNode} children - I componenti figli che avranno accesso al contesto delle notifiche.
 *
 * @returns {JSX.Element} Il componente `NotificationProvider` che avvolge i componenti figli.
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(5);

  /**
   * Effettua il setup dei listener per il socket e aggiorna le notifiche quando ne arriva una nuova.
   * Viene eseguito solo una volta al montaggio del componente grazie all'array di dipendenze vuoto.
   */
  useEffect(() => {
    const cleanup = setupSocketListeners((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setNotificationCount((prev) => prev + 1);
    });

    return cleanup;
  }, []);

  /**
   * Aggiorna le notifiche visibili ogni volta che le notifiche o l'indice corrente cambiano.
   */
  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, currentNotificationIndex));
  }, [notifications, currentNotificationIndex]);

  /**
   * Funzione per caricare più notifiche visibili.
   * Aumenta l'indice corrente per caricare un numero maggiore di notifiche.
   */
  const loadMoreNotifications = () => {
    setCurrentNotificationIndex((prevIndex) =>
      Math.min(prevIndex + 5, notifications.length)
    );
  };

  /**
   * Funzione per azzerare il conteggio delle notifiche non lette.
   */
  const markNotificationsAsRead = () => {
    setNotificationCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationCount,
        visibleNotifications,
        loadMoreNotifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
