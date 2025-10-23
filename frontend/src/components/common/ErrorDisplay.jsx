/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `ErrorDisplay`, che viene utilizzato per mostrare un messaggio di errore
 * all'interno dell'interfaccia utente. Il messaggio viene passato come una proprietà e viene visualizzato in rosso
 * per evidenziare eventuali errori.
 *
 * @module ErrorDisplay
 */

import React from "react";

/**
 * Componente che visualizza un messaggio di errore.
 *
 * @component
 *
 * @param {Object} props - Le proprietà passate al componente.
 * @param {string} props.message - Il messaggio di errore da visualizzare.
 *
 * @returns {JSX.Element} Un elemento JSX che rappresenta un paragrafo con il messaggio di errore stilizzato.
 */

const ErrorDisplay = ({ message }) => <p className="text-red-500">{message}</p>;

export default ErrorDisplay;
