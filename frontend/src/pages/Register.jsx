/**
 * @namespace pages
 * @fileoverview
 * Il file contiene un componente di registrazione dell'utente.
 * Quando l'utente compila il modulo e lo invia, viene effettuata una richiesta all'API di registrazione.
 * Se la registrazione è riuscita, l'utente viene reindirizzato alla pagina di login e viene visualizzato un messaggio di successo.
 * Se la registrazione fallisce, viene mostrato un messaggio di errore.
 * Il componente utilizza lo stato per gestire i valori dei campi del modulo, i messaggi di errore e di successo.
 *
 * @module Register
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/authAPI";

import Input from "../components/form/Input";
import Button from "../components/form/Button";
import Footer from "../components/common/Footer";

/**
 * Componente per la registrazione dell'utente.
 * Permette agli utenti di creare un nuovo account con nome utente, email e password.
 * Gestisce la validazione dei campi, la registrazione dell'utente tramite API, e la visualizzazione di messaggi di errore o successo.
 *
 * @function Register
 * @returns {JSX.Element} Il componente di registrazione.
 */
function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  /**
   * Gestisce l'invio del form di registrazione.
   * Invia i dati al server tramite `registerUser` e, in caso di successo,
   * reindirizza l'utente al login.
   *
   * @param {Object} e - L'evento di invio del form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(username, email, password);
      setSuccess(response.message);
      setError(""); // Reset degli errori
      navigate("/login");
    } catch (error) {
      setError(error.message); // Mostra l'errore ricevuto dal backend
      setSuccess(""); // Resetta il messaggio di successo
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
          <h2 className="text-2xl text-center text-white mb-6">
            Crea un nuovo account
          </h2>
          {/* Messaggi errore e successo*/}
          {success && <div style={{ color: "green" }}>{success}</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}

          {/* Form di registrazione */}
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

            {/* Campo Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="email@example.com"
              required
              className="focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            {/* Conferma password */}
            <Input
              label="Conferma Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              className="focus:ring-blue-500 focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Pulsante di registrazione */}
            <Button text="Registrati" type="submit" />

            {/* Link per la login page */}
            <p className="text-sm text-center text-gray-400 mt-4">
              Hai già un account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Accedi
              </Link>
            </p>
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Register;
