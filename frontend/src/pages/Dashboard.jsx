/**
 * @namespace pages
 * @fileoverview
 * Componente principale della dashboard.
 * Questo componente include una barra di navigazione (Navbar), un menu laterale (Menu),
 * e un'area centrale per visualizzare il contenuto delle rotte figlie.
 * È inoltre utilizzato per fornire un contesto di notifiche tramite il `NotificationProvider`.
 *
 * @module Dashboard
 */

import React from "react";
import Navbar from "../components/common/Navbar";
import Menu from "../components/common/Menu";
import { Outlet } from "react-router-dom";
import { NotificationProvider } from "../context/notificationContext";

/**
 * @component
 * Componente principale del dashboard.
 * Gestisce la disposizione degli elementi principali della dashboard,
 * come la navbar, il menu laterale e l'area contenente il contenuto dinamico
 * basato sulle rotte figlie (per esempio, Home, Edifici, etc.).
 *
 * Il `NotificationProvider` viene utilizzato per fornire notifiche globali
 * attraverso il contesto delle notifiche a tutti i componenti figli.
 *
 * @returns {JSX.Element} - La struttura della dashboard con Navbar, Menu e il contenuto dinamico delle rotte.
 */

function Dashboard() {
  return (
 
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "rgb(17 24 39 / var(--tw-bg-opacity, 1))", // Blu-grigio scuro personalizzato
        "--tw-bg-opacity": "1", // Opacità Tailwind compatibile
      }}
    >
      <NotificationProvider>
        <Navbar />
        <Menu />
        <div className="flex-grow p-2">
          <Outlet />
        </div>
      </NotificationProvider>

    </div>


  );
}

export default Dashboard;