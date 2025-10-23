/**
 * @namespace pages
 * @fileoverview Componente React per richiedere il reset della password.
 * Consente agli utenti di inserire il proprio indirizzo email per ricevere un link per reimpostare la password.
 *
 * @module RequestPasswordReset
 */

import React, { useState } from "react";
import { requestPasswordReset } from "../utils/userAPI";
import { Link } from "react-router-dom";
import Input from "../components/form/Input";
import Button from "../components/form/Button";
import Footer from "../components/common/Footer";

/**
 * Componente per richiedere il reset della password.
 *
 * @component
 * @returns {JSX.Element} Form per l'inserimento dell'email con messaggi di feedback per l'utente.
 */
function RequestPasswordReset() {
  const [email, setEmail] = useState(""); // Stato per gestire l'input email
  const [message, setMessage] = useState(""); // Stato per messaggi di successo
  const [error, setError] = useState(""); // Stato per messaggi di errore

  /**
   * Gestisce l'invio del form.
   *
   * @param {React.FormEvent<HTMLFormElement>} e L'evento di submit del form.
   * @async
   * @function
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await requestPasswordReset(email);
      console.log(response);
      setMessage(response.message);
      setError("");
    } catch (error) {
      if (error.response) {
        setError(error.response.message);
      } else {
        setError(error.message);
      }
      setMessage("");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        {/* Logo CSTE, usando un'immagine */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="logo-cste.png"
            alt="Logo CSTE"
            className="h-28 mr-2" // Regola l'altezza del logo
          />
        </div>
        <div className="w-full sm:w-96 md:w-1/3 lg:w-1/4 dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Recupero Password
          </h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Form di richiesta per il reset della password */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Inserisci il tuo indirizzo email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button text="Invia richiesta" type="submit" />
            <p className="text-center text-sm text-gray-500">
              Non hai bisogno di reimpostare la password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
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

export default RequestPasswordReset;
