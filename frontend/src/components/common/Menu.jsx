/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `Menu`, che gestisce la visualizzazione del menu di navigazione
 * nell'interfaccia utente. Il menu è dinamico e si adatta in base al ruolo dell'utente, mostrando voci di menu
 * diverse per gli utenti normali e gli amministratori. Il componente utilizza Redux per determinare il ruolo
 * dell'utente e visualizzare gli elementi del menu di conseguenza.
 *
 * @module Menu
 */

import React from "react";
import TabMenuItem from "./TabMenuItem"; // Importiamo il componente TabMenuItem

import { useSelector } from "react-redux";

/**
 * Componente che renderizza un menu di navigazione con voci dinamiche in base al ruolo dell'utente.
 * Gli utenti amministratori vedranno voci di menu aggiuntive rispetto agli utenti normali.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <Menu />
 *
 * @returns {JSX.Element} Il menu di navigazione.
 */
const Menu = () => {
  const isAdmin = useSelector((state) => state.user.role) == 1;

  // Elementi per tutti gli utenti
  const menuItems = [
    { to: "/dashboard/home", label: "Home" },
    { to: "/dashboard/edifici", label: "Monitoraggio Sensori Edifici" },
    { to: "/dashboard/advancedAnalysis", label: "Analisi avanzata dati Energetici/Idrici" },
    { to: "/dashboard/pdf-viewer", label: "Carica PDF dati idrici" },
    { to: "/dashboard/pdf-data", label: "Visualizza dati idrici" },
    { to: "/dashboard/logs", label: "Cronologia anomalie" },
    { to: "/dashboard/report", label: "Reportistica" },
  ];

  // Elementi specifici per gli amministratori
  const adminMenuItems = [
    { to: "/dashboard/#bollette", label: "Bollette" },
    { to: "/dashboard/userManagement", label: "Gestione Utenti" },
  ];

  return (
    <div className="bg-gray-800 text-white text-lg p-2 pb-0 mb-0">
      {}
      <div className="flex space-x-4">
        {menuItems.map((item) => (
          <TabMenuItem key={item.to} to={item.to} label={item.label} />
        ))}

        {isAdmin &&
          adminMenuItems.map((item) => (
            <TabMenuItem key={item.to} to={item.to} label={item.label} />
          ))}
      </div>
    </div>
  );
};

export default Menu;
