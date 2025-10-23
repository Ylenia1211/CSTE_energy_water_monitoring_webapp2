/**
 * @namespace routes
 * @fileoverview
 * Questo file definisce le rotte principali di un'applicazione React utilizzando la libreria `react-router-dom`.
 * Include protezioni per rotte sensibili e componenti avanzati per la gestione degli utenti, dashboard, e altre funzionalità dell'applicazione.
 *
 * @module AppRoutes
 * @requires react
 * @requires react-router-dom
 * @requires ProtectedRoute
 * @requires AdminProtectedRoute
 * @requires FilterProvider
 */

import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Logout from "../pages/Logout";
import Dashboard from "../pages/Dashboard";

import Home from "../pages/Home";
import Edifici from "../pages/Edifici";
import Unauthorized from "../pages/Unauthorized";

import { FilterProvider } from "../context/filterContext"; // Importa il contesto per i filtri
import Profile from "../pages/Profile";
import UserManagement from "../pages/UserManagement";
import Logs from "../pages/Logs";
import Settings from "../pages/Settings";
import AdvancedAnalysis from "../pages/AdvancedAnalysis";
import ReportConfigurator from "../pages/ReportConfigurator";
import RequestPasswordReset from "../pages/RequestPasswordReset";
import ResetPassword from "../pages/ResetPassword";
import PdfViewer from "../pages/PdfViewer"; // nuovo import
import PdfRecordsTable from "../pages/PdfRecordsTable";

/**
 * Configurazione delle rotte dell'applicazione.
 * Utilizza `createBrowserRouter` per definire le rotte principali.
 * Le rotte protette sono gestite da `ProtectedRoute` e `AdminProtectedRoute` per il controllo degli accessi.
 */
const router = createBrowserRouter([
  /**
   * Reindirizzamento dalla root ("/") alla dashboard principale.
   * Questa rotta è protetta da `ProtectedRoute`.
   */
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/dashboard/home" replace />
      </ProtectedRoute>
    ),
  },

  /**
   * Rotte protette della dashboard.
   * Queste rotte includono diverse funzionalità come gestione utenti, analisi avanzate e configurazione report.
   */
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "home",
        element: <Home />, // Pagina principale della dashboard
      },
      {
        path: "advancedAnalysis",
        element: <AdvancedAnalysis />, // Analisi avanzate
      },
      {
        path: "report",
        element: (
          <FilterProvider>
            <ReportConfigurator />
          </FilterProvider>
        ),
      },
      {
        path: "edifici",
        element: (
          <FilterProvider>
            <Edifici />
          </FilterProvider>
        ),
      },
      {
        path: "logs",
        element: <Logs />, // Visualizzazione dei log di sistema
      },
      {
      path: "pdf-viewer",
      element: <PdfViewer />, //  nuova rotta PDF
     },
       {
      path: "pdf-data",
      element: <PdfRecordsTable />, //  nuova rotta PDF
     },
     
      {
        path: "userManagement",
        element: (
          <FilterProvider>
            <AdminProtectedRoute>
              <UserManagement />
            </AdminProtectedRoute>
          </FilterProvider>
        ),
      },
      {
        path: "logout",
        element: <Logout />, // Logout utente
      },
      {
        path: "profile",
        element: <Profile />, // Profilo utente
      },
      {
        path: "settings",
        element: <Settings />, // Impostazioni dell'app
      },
    ],
  },

  /**
   * Rotte pubbliche per login, registrazione e gestione password.
   */
  {
    path: "/login",
    element: <Login />, // Pagina di login
  },
  {
    path: "/password-reset",
    element: <RequestPasswordReset />, // Richiesta di reset della password
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />, // Pagina di reset password con token
  },
  {
    path: "/register",
    element: <Register />, // Registrazione nuovo utente
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />, // Accesso non autorizzato
  },

  /**
   * Nota: Per tutte le rotte riservate agli amministratori utilizzare il componente `AdminProtectedRoute`.
   */
]);

/**
 * Configurazioni avanzate per il futuro di `react-router-dom`.
 * Queste opzioni abilitano funzionalità come idratazione parziale e transizioni ottimizzate.
 */
const futurev7 = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_partialHydration: true,
  v7_normalizeFormMethod: true,
  v7_skipActionErrorRevalidation: true,
};

/**
 * Componente principale per fornire le rotte all'applicazione.
 * Utilizza `RouterProvider` per applicare le rotte configurate nel router.
 * @function AppRoutes
 * @returns {JSX.Element} Elemento JSX che racchiude il provider delle rotte.
 */
const AppRoutes = () => {
  return <RouterProvider router={router} future={futurev7} />;
};

export default AppRoutes;
