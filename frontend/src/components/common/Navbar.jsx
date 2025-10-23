/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `Navbar`, che rappresenta la barra di navigazione dell'applicazione.
 * La barra include funzionalità come la visualizzazione delle notifiche, il menu a tendina per il profilo utente,
 * e l'accesso rapido a diverse pagine tramite link. Le notifiche vengono caricate dinamicamente e possono essere
 * visualizzate o archiviate. Il componente sfrutta il contesto delle notifiche e lo stato per gestire l'interazione.
 *
 * @module Navbar
 */

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa"; // Icone di FontAwesome per notifiche e profilo
import { NotificationContext } from "../../context/notificationContext";
import { useSelector } from "react-redux";
import Notifications from "./Notifications"; // Importa il componente Notifications

/**
 * Componente che rappresenta la barra di navigazione dell'applicazione.
 * Include una sezione per le notifiche con un contatore e un dropdown per visualizzare le notifiche,
 * un menu a tendina per il profilo utente con link per il profilo, le impostazioni e il logout.
 *
 * Il componente gestisce lo stato per l'apertura e la chiusura dei dropdown, nonché il caricamento
 * delle notifiche e la gestione del loro stato (lettura delle notifiche).
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <Navbar />
 *
 * @returns {JSX.Element} La barra di navigazione completa con le icone e i dropdown.
 */
const Navbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    notifications,
    notificationCount,
    visibleNotifications,
    loadMoreNotifications,
    markNotificationsAsRead,
  } = useContext(NotificationContext);
  const userName = useSelector((state) => state.user.user.username);

  /**
   * Gestisce l'apertura e la chiusura del dropdown delle notifiche.
   * Inoltre, segna le notifiche come lette quando vengono visualizzate.
   */
  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen); // Apre/chiude il dropdown delle notifiche
    setIsDropdownOpen(false);
    markNotificationsAsRead();
  };

  /**
   * Gestisce l'apertura e la chiusura del dropdown del profilo utente.
   */
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  /**
   * Chiude entrambi i dropdown (notifiche e profilo) quando necessario.
   */
  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  /**
   * Gestisce il clic sui link del menu a tendina per chiudere il dropdown.
   */
  const handleLinkClick = () => {
    closeDropdown(); // Chiude il dropdown quando un link viene cliccato
  };

  // Link del dropdown profilo
  const dropdownLinks = [
    { to: "/dashboard/profile", label: "Profilo" },
    { to: "/dashboard/settings", label: "Impostazioni" },
    { to: "/dashboard/logout", label: "Logout" },
  ];

  return (
    <header className=" bg-indigo-900 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <div className=" flex items-center space-x-4">
        <img src="/logo-cste.png" alt="Logo" className="w-12 h-12" />
        <span className="text-3xl">
           Dashboard CSTE
        </span>
      </div>

      {/* Icone a destra */}
      <div className="flex items-center space-x-6 relative">
        {/* Notifiche */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-700"
            onClick={handleNotificationClick}
          >
            <FaBell size={24} />
            {/* Mostra il numeretto solo se ci sono notifiche */}
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-center text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* Dropdown notifiche */}
          {isNotificationsOpen && (
            <div className="overflow-y-auto absolute z-50 right-0 mt-2 w-64 h-64 bg-gray-800 text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out">
              {/* Mostra solo le notifiche visibili */}
              {visibleNotifications.length > 0 ? (
                <Notifications notifications={visibleNotifications} />
              ) : (
                <div className="p-2 text-center">Nessuna notifica</div>
              )}
              {/* Bottone per vedere altre notifiche */}
              {notifications.length > 5 &&
                visibleNotifications.length < notifications.length && (
                  <div className="p-2 text-center">
                    <button
                      onClick={loadMoreNotifications}
                      className="text-blue-500 hover:underline"
                    >
                      Vedi altre notifiche
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
        {/* Profilo */}
        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 ease-in-out"
          >
            <FaUserCircle size={24} />
            <span className="text-l">{userName}</span>
          </button>

          {/* Dropdown del profilo */}
          {isDropdownOpen && (
            <div
              className={`absolute top-11 right-0 w-48 bg-gray-800 text-white rounded-lg shadow-lg p-2 mt-2 transition-all duration-300 ease-in-out transform ${
                isDropdownOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              {dropdownLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  onClick={handleLinkClick}
                  className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
