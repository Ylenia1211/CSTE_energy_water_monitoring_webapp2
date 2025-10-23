/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `DashboardPanel`, che rappresenta un pannello generico
 * per la dashboard. Il pannello può contenere qualsiasi tipo di contenuto (passato tramite la proprietà
 * `children`) e viene stilizzato con uno sfondo bianco, angoli arrotondati, ombreggiatura e un effetto hover.
 * È progettato per essere utilizzato come contenitore per visualizzare dati o componenti in un layout di tipo dashboard.
 *
 * @module DashboardPanel
 */

import React from "react";

/**
 * Componente per visualizzare un pannello nella dashboard con un titolo e contenuto.
 * Il pannello è progettato per essere flessibile e facilmente personalizzabile.
 *
 * @component
 * @param {Object} props - Proprietà del componente.
 * @param {string} props.title - Il titolo da visualizzare nel pannello.
 * @param {ReactNode} props.children - Il contenuto del pannello.
 * @param {Object} [props.style] - Stile opzionale per sovrascrivere le proprietà CSS predefinite.
 * @returns {JSX.Element} Un pannello contenente il titolo e il contenuto specificato.
 */
const DashboardPanel = ({ title, children, style }) => {
  return (
    <div
className="bg-stone-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-100 flex flex-col border border-200"
      style={{
        minHeight: "200px", // Altezza minima per evitare dimensioni troppo piccole
        height: "auto", // Altezza automatica in base al contenuto
        // flex: "1 1 48%", // Ogni pannello prende il 48% della larghezza disponibile (con margini)
        overflow: "hidden", // Impedisce che il contenuto esca dai bordi del pannello
        // flexBasis: "calc(33.333% - 1rem)",
      }}
    >
      <h3 className="text-xl text-black-800">{title}</h3>
      <div className="mt-4 flex-grow">{children}</div>
    </div>
  );
};

export default DashboardPanel;
