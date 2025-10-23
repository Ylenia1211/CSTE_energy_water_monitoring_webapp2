/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `LoadingSpinner`, che visualizza un'animazione di caricamento.
 * Il componente è personalizzabile in termini di dimensioni e colore del cerchio di caricamento.
 *
 * @module LoadingSpinner
 */

import React from "react";

/**
 * Componente che visualizza un'animazione di caricamento (spinner).
 * Il componente accetta opzioni per personalizzare la dimensione e il colore dello spinner.
 *
 * @component
 *
 * @param {Object} props - Le proprietà passate al componente.
 * @param {string} [props.size="6"] - La dimensione dello spinner, espressa come valore di larghezza (default è 6).
 * @param {string} [props.color="blue"] - Il colore del bordo superiore dello spinner (default è blue).
 *
 * @returns {JSX.Element} Un elemento JSX che rappresenta lo spinner di caricamento.
 */

const LoadingSpinner = ({ size = "6", color = "blue" }) => (
  <div className="flex justify-center items-center mt-6">
    <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-6 h-6"></div>
  </div>
);

export default LoadingSpinner;
