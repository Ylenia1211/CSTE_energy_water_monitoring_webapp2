/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `DraggableSection`, che rappresenta una sezione trascinabile
 * all'interno di una lista. Utilizzando la libreria `react-dnd`, il componente consente all'utente di riordinare
 * le sezioni in un'interfaccia tramite il drag-and-drop. Ogni sezione ha un titolo, una configurazione visibile
 * e due opzioni di azione: modificare e rimuovere. Inoltre, mostra un indicatore visivo durante il drag per
 * evidenziare la posizione di drop.
 *
 * @module DraggableSection
 */

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FaGripVertical } from "react-icons/fa";

const ItemType = { SECTION: "section" };

/**
 * Componente che rappresenta una sezione riordinabile tramite drag-and-drop.
 * Ogni sezione può essere modificata o rimossa e ha un comportamento di drag per il riordino.
 *
 * @component
 *
 * @param {Object} props - Le proprietà passate al componente.
 * @param {Object} props.section - La sezione da visualizzare e manipolare.
 * @param {number} props.index - L'indice della sezione nella lista.
 * @param {Function} props.moveSection - Funzione per spostare la sezione nella lista.
 * @param {Function} props.removeSection - Funzione per rimuovere la sezione dalla lista.
 * @param {boolean} props.showIndicator - Indica se deve essere mostrato l'indicatore di posizione.
 * @param {number} props.indicatorPosition - La posizione corrente dell'indicatore di drop.
 * @param {Function} props.onDragEnter - Funzione chiamata quando il mouse entra nella sezione.
 * @param {Function} props.onDragLeave - Funzione chiamata quando il mouse esce dalla sezione.
 * @param {Function} props.editSection - Funzione per modificare la sezione.
 *
 * @returns {JSX.Element} Un elemento JSX che rappresenta la sezione draggable con le opzioni di modifica e rimozione.
 */
const DraggableSection = ({
  section,
  index,
  moveSection,
  removeSection,
  showIndicator,
  indicatorPosition,
  onDragEnter,
  onDragLeave,
  editSection, // Funzione per la modifica
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType.SECTION,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSection(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.SECTION,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <li
      ref={ref}
      className={`relative flex justify-between items-center bg-gray-100 p-3 rounded-lg ${
        isDragging ? "bg-blue-300 shadow-lg" : ""
      }`}
      style={{ cursor: "move" }}
      onDragEnter={() => onDragEnter(index)}
      onDragLeave={onDragLeave}
    >
      {/* Indicatore di posizione di drop */}
      {showIndicator && indicatorPosition === index && (
        <div className="absolute top-0 left-0 w-full border-t-4 border-blue-500"></div>
      )}
      {showIndicator && indicatorPosition === index + 1 && (
        <div className="absolute bottom-0 left-0 w-full border-b-4 border-blue-500"></div>
      )}
      <div className="flex items-center">
        <FaGripVertical className="text-gray-600 mr-3 cursor-move" />
        <div>
          <p className="text-gray-700 font-medium">
            {section.config.title
              ? section.config.title
              : `Sezione ${index + 1}`}
            : {section.type.toUpperCase()}
          </p>
          <p className="text-gray-500 text-sm">
            Config: {JSON.stringify(section.config)}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => editSection(index)}
          className="text-blue-500 hover:text-blue-700"
        >
          Modifica
        </button>
        <button
          onClick={() => removeSection(index)}
          className="text-red-500 hover:text-red-700"
        >
          Rimuovi
        </button>
      </div>
    </li>
  );
};

export default DraggableSection;
