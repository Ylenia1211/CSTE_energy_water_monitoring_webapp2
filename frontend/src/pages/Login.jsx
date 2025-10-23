/**
 * @namespace pages
 * @fileoverview
 * Componente di login per gli utenti. Questo modulo gestisce l'autenticazione
 * degli utenti, inviando la richiesta di login al server tramite la funzione `loginUser`.
 * Se la richiesta ha esito positivo, l'utente viene autenticato e i dati dell'utente
 * vengono memorizzati nello stato globale tramite Redux.
 *
 * @module Login
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice"; // Importa l'azione

import { loginUser } from "../utils/authAPI";

import Input from "../components/form/Input";
import Button from "../components/form/Button";
import Footer from "../components/common/Footer";

/**
 * Componente per la pagina di login dell'utente.
 * Consente all'utente di accedere tramite username e password.
 * In caso di successo, l'utente viene reindirizzato alla dashboard.
 *
 * @returns {JSX.Element} - La struttura del form di login.
 */
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userDispatch = useDispatch();

  /**
   * Gestisce l'invio del form di login.
   * Invia i dati al server tramite `loginUser` e, in caso di successo,
   * memorizza i dati dell'utente in Redux e reindirizza l'utente alla dashboard.
   *
   * @param {Object} e - L'evento di invio del form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      if (response.data.token) {
        console.log({
          user: response.data.user,
          role: response.data.user.privileges,
          token: response.data.token,
        });
        userDispatch(
          login({
            user: response.data.user,
            role: response.data.user.privileges,
            token: response.data.token,
          })
        );
        navigate("/dashboard/home");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        // Risposta del server con un messaggio di errore dettagliato
        setError(error.response.data.message);
      } else {
        // Errore di connessione o altro errore
        setError(error.message);
      }
    }
  };

  return (
    <>
      {/* Contenitore */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        {/* Logo CSTE, usando un'immagine */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="logo-cste.png"
            alt="Logo CSTE"
            className="h-28 mr-2" // Regola l'altezza del logo
          />
        </div>
        {/* Contenitore del form */}
        <div className="w-full sm:w-96 md:w-1/3 lg:w-1/4 dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {/* Titolo del form */}
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Accedi al tuo account
          </h2>
          {/* Errori nel login */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Form di login */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Username */}
            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="Nome utente"
              required
              className="focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Campo Password */}
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Link per la password dimenticata */}
            <div className="flex justify-end">
              <Link
                to="/password-reset"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Hai dimenticato la password?
              </Link>
            </div>

            {/* Pulsante di accesso */}
            <Button text="Accedi" type="submit" />

            {/* Link per la registrazione */}
            <p className="text-sm text-center text-gray-400 mt-4">
              Non hai un account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:underline"
              >
                Registrati
              </Link>
            </p>
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Login;
