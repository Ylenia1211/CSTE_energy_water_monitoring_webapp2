/**
 * @namespace pages
 * @fileoverview Componente React per la reimpostazione della password.
 * Gli utenti possono inserire una nuova password utilizzando un token di reset inviato tramite email.
 *
 * @module ResetPassword
 */

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../utils/userAPI";
import Input from "../components/form/Input";
import Button from "../components/form/Button";
import Footer from "../components/common/Footer";

/**
 * Componente per la reimpostazione della password.
 *
 * @component
 * @returns {JSX.Element} Form per impostare una nuova password.
 */
function ResetPassword() {
  const { token } = useParams(); // Ottiene il token di reset dalla URL
  const [newPassword, setNewPassword] = useState(""); // Stato per la nuova password
  const [message, setMessage] = useState(""); // Stato per messaggi di successo
  const [error, setError] = useState(""); // Stato per messaggi di errore
  const navigate = useNavigate(); // Hook per la navigazione programmatica

  /**
   * Gestisce l'invio del form per la reimpostazione della password.
   *
   * @param {React.FormEvent<HTMLFormElement>} e L'evento di submit del form.
   * @async
   * @function
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(token, newPassword);
      console.log(response);
      setMessage(
        response.message +
          ". Verrai rediretto in automatico alla pagina di login."
      );
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirezione alla pagina di login dopo 2 secondi
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
            Reimposta Password
          </h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Form per impostare la nuova password */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nuova Password"
              type="password"
              name="password"
              placeholder="Inserisci la nuova password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button text="Reimposta Password" type="submit" />
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

export default ResetPassword;
