/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente `Button`, un semplice pulsante riutilizzabile in React. Il pulsante supporta la personalizzazione del testo,
 * la gestione di eventi al clic e il tipo del pulsante (come "submit", "button" o "reset").
 * Il pulsante è stilizzato con classi Tailwind CSS per apparire visivamente attraente e interattivo.
 *
 * @module Button
 */

import React from "react";

/**
 * Componente pulsante riutilizzabile per applicazioni React.
 * Questo componente rende un pulsante personalizzabile con il testo, la gestione dell'evento al clic e il tipo di pulsante.
 * È possibile utilizzarlo per vari scopi come inviare moduli, interagire con l'utente o eseguire azioni personalizzate.
 *
 * @component
 * @example
 * return (
 *   <Button text="Clicca Qui" onClick={handleClick} />
 * );
 *
 * @param {string} text - Il testo da visualizzare all'interno del pulsante.
 * @param {function} onClick - Funzione da eseguire quando l'utente clicca sul pulsante.
 * @param {string} [type="button"] - Tipo del pulsante (opzionale), predefinito è "button".
 *
 * @returns {JSX.Element} Il pulsante stilizzato con Tailwind CSS.
 */

const Button = ({ text, onClick, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
  >
    {text}
  </button>
);

export default Button;
