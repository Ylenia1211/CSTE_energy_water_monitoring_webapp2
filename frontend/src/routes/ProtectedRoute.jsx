/**
 * @namespace routes
 * @fileoverview
 * Il file `ProtectedRoute.jsx` contiene un componente di protezione delle route per applicazioni React.
 * Questo componente garantisce che solo gli utenti autenticati possano accedere alle route protette.
 * Se l'utente non è autenticato, verrà reindirizzato automaticamente alla pagina di login.
 *
 * Il componente utilizza `useSelector` da Redux per ottenere lo stato di autenticazione dell'utente
 * e `Navigate` da `react-router-dom` per gestire il reindirizzamento in caso di accesso negato.
 *
 * Utilizzo tipico:
 * - Protezione delle route riservate agli utenti autenticati.
 * - Garantire che solo gli utenti autenticati possano visualizzare determinati contenuti.
 *
 * @module ProtectedRoute
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute è un componente che protegge una route da accessi non autorizzati.
 * Se l'utente non è autenticato, verrà reindirizzato alla pagina di login.
 * Se l'utente è autenticato, i figli passati al componente verranno renderizzati.
 *
 * @component
 * @example
 * // Utilizzo del componente ProtectedRoute
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @param {object} props - Le proprietà passate al componente.
 * @param {React.ReactNode} props.children - I figli che devono essere renderizzati se l'utente è autenticato.
 *
 * @returns {React.ReactNode} - Un componente JSX che può essere:
 * - I figli passati se l'utente è autenticato.
 * - Un redirect alla pagina di login se l'utente non è autenticato.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
