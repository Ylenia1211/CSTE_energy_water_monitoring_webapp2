/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente `Input`, che rende un campo di input personalizzabile con etichetta, tipo, valore, e altre proprietà.
 * Il componente è stilizzato con classi Tailwind CSS per offrire un aspetto coerente e reattivo, inclusi effetti di focus e modalità scura.
 * È progettato per essere utilizzato in form interattivi in un'applicazione React.
 *
 * @module Input
 */

import React from "react";

/**
 * Componente di input personalizzabile per form in React.
 * Il componente include un'etichetta (label), un campo di input e supporta diverse personalizzazioni
 * come tipo, valore, segnaposto, e validazione obbligatoria. È ottimizzato per l'accessibilità e il design responsivo.
 *
 * @component
 * @example
 * return (
 *   <Input
 *     label="Nome"
 *     type="text"
 *     name="name"
 *     placeholder="Inserisci il tuo nome"
 *     value={name}
 *     onChange={handleNameChange}
 *     required={true}
 *   />
 * );
 *
 * @param {string} label - L'etichetta da visualizzare sopra il campo di input.
 * @param {string} type - Il tipo dell'input, ad esempio "text", "password", "email", ecc.
 * @param {string} name - Il nome dell'input, che viene utilizzato per identificare il campo nei form.
 * @param {string} placeholder - Il testo del segnaposto da visualizzare quando il campo è vuoto.
 * @param {string} value - Il valore attuale del campo di input.
 * @param {function} onChange - La funzione da eseguire quando il valore dell'input cambia.
 * @param {boolean} required - Se il campo è obbligatorio o meno nel form.
 *
 * @returns {JSX.Element} Un campo di input stilizzato con l'etichetta e le classi di Tailwind CSS.
 */
const Input = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  required,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="on"
    />
  </div>
);

export default Input;
