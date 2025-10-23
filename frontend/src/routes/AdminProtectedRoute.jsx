/**
 * @namespace routes
 * @fileoverview
 * Il file `AdminProtectedRoute.jsx` contiene un componente di protezione delle route per applicazioni React.
 * Questo componente garantisce che solo gli utenti autenticati con il ruolo di amministratore possano
 * accedere alle route protette. Se l'utente non è autenticato o non ha il ruolo di amministratore,
 * verrà reindirizzato automaticamente alla pagina di login o alla pagina di accesso negato.
 *
 * Il componente utilizza `useSelector` da Redux per ottenere lo stato dell'utente (autenticazione e ruolo)
 * e `Navigate` da `react-router-dom` per gestire i redirect.
 *
 * Utilizzo tipico:
 * - Protezione delle route riservate agli amministratori.
 * - Garantire che solo gli utenti con il ruolo appropriato possano visualizzare contenuti sensibili o
 * amministrativi.
 *
 * @module AdminProtectedRoute
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * AdminProtectedRoute è un componente di protezione per le route riservate agli amministratori.
 * Questo componente controlla se l'utente è autenticato e se ha il ruolo di amministratore
 * (con valore "1"). Se l'utente non è autenticato, verrà reindirizzato alla pagina di login.
 * Se l'utente non ha il ruolo di amministratore, verrà reindirizzato alla pagina di "accesso negato".
 * Se l'utente è autenticato e ha il ruolo di amministratore, il componente renderizza i figli passati.
 *
 * @component
 * @example
 * // Utilizzo del componente AdminProtectedRoute
 * <AdminProtectedRoute>
 *   <Dashboard />
 * </AdminProtectedRoute>
 *
 * @param {object} props - Le proprietà passate al componente.
 * @param {React.ReactNode} props.children - I figli che devono essere renderizzati se le condizioni di protezione sono soddisfatte.
 *
 * @returns {React.ReactNode} - Un componente JSX che può essere:
 * - Un redirect alla pagina di login se l'utente non è autenticato.
 * - Un redirect alla pagina di "accesso negato" se l'utente non è un amministratore.
 * - I figli passati se l'utente è autenticato e ha il ruolo di amministratore.
 */
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.user);

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Se l'utente non ha il ruolo di amministratore, reindirizza alla pagina di accesso negato
  if (role != "1") {
    return <Navigate to="/unauthorized" />;
  }

  // Se l'utente è autenticato e ha il ruolo di amministratore, renderizza i figli
  return children;
};

export default AdminProtectedRoute;
