/**
 * @namespace pages
 * @fileoverview
 * Componente che mostra un messaggio di errore per gli utenti non autorizzati.
 * Questo componente viene visualizzato quando l'utente cerca di accedere a una pagina
 * senza i permessi necessari.
 * Il messaggio fornisce anche un link per tornare alla home page.
 *
 * @module Unauthorized
 */

import React from "react";
import { Link } from "react-router-dom";

/**
 * Componente che viene mostrato quando l'utente non è autorizzato ad accedere a una pagina.
 * Mostra un messaggio con un link che rimanda alla home page.
 *
 * @function Unauthorized
 * @returns {JSX.Element} Un messaggio di errore con un link per tornare alla home.
 */
function Unauthorized() {
  return (
    <div className="flex h-screen justify-center text-5xl font-bold ">
      <h1>
        Non sei autorizzato a visualizzare questa pagina.{" "}
        <Link className="text-blue-500" to="/">
          {" "}
          Vai alla home
        </Link>
      </h1>
    </div>
  );
}

export default Unauthorized;
