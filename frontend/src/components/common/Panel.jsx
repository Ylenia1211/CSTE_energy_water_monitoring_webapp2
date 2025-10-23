/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `Panel`, che rappresenta un pannello interattivo
 * che può essere minimizzato o messo a schermo intero. Il pannello può contenere un
 * contenuto personalizzato, che viene visualizzato quando il pannello non è minimizzato.
 * Le funzionalità di minimizzazione e di schermo intero sono gestite tramite bottoni con
 * icone di FontAwesome.
 *
 * @module Panel
 */

import React, { useState, useCallback } from "react";
import { FaRegWindowMinimize, FaArrowsAlt, FaTimes } from "react-icons/fa"; // Icone per la gestione dei pannelli

/**
 * Componente `Panel` che visualizza un pannello interattivo che può essere minimizzato,
 * ingrandito o ridotto a schermo intero. Il pannello può contenere qualsiasi contenuto
 * passato come `children`. Le azioni di minimizzazione e schermo intero sono gestite tramite
 * i relativi bottoni.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <Panel
 *   panelId="panel1"
 *   title="Pannello di esempio"
 *   onFullscreenToggle={handleFullscreenToggle}
 *   isFullscreen={false}
 *   closeFullscreen={handleCloseFullscreen}
 *   filters={filters}
 * >
 *   <div>Contenuto del pannello</div>
 * </Panel>
 *
 * @param {string} panelId - Identificativo unico per il pannello. Usato per gestire il passaggio alla modalità schermo intero.
 * @param {string} title - Il titolo del pannello che viene visualizzato nell'intestazione.
 * @param {function} onFullscreenToggle - Funzione callback chiamata per attivare la modalità schermo intero.
 * @param {boolean} isFullscreen - Stato che indica se il pannello è a schermo intero.
 * @param {function} closeFullscreen - Funzione per chiudere la modalità schermo intero.
 * @param {React.ReactNode} children - Il contenuto da visualizzare all'interno del pannello.
 * @param {Object} filters - Filtri opzionali da passare al contenuto del pannello.
 * @param {boolean} [isMinimized=true] - Stato iniziale del pannello, se minimizzato o meno.
 *
 * @returns {JSX.Element} Un pannello con funzionalità di minimizzazione e modalità schermo intero.
 */
const Panel = React.memo(
  ({
    panelId,
    title,
    onFullscreenToggle,
    isFullscreen,
    closeFullscreen,
    children,
    filters,
    isMinimized = true,
  }) => {
    const [minimized, setMinimized] = useState(isMinimized);

    // Funzione per gestire la minimizzazione del pannello
    const toggleMinimize = useCallback(() => {
      setMinimized((prev) => !prev);
      if (isFullscreen) {
        closeFullscreen();
      }
    }, [isFullscreen, closeFullscreen]);

    // Funzione per gestire la modalità a schermo intero
    const toggleFullscreen = useCallback(() => {
      setMinimized(true); // Se è espanso o in modalità schermo intero, riducilo prima
      onFullscreenToggle(panelId); // Notifica il wrapper per passare al fullscreen
    }, [isFullscreen, onFullscreenToggle, panelId]);

    return (
      <div
        className={`${
          minimized
            ? "h-11 py-2 px-4 w-full" // Se il pannello è minimizzato, è solo una barra
            : isFullscreen
            ? "w-full h-full bg-white p-4 overflow-auto" // Se il pannello è a schermo intero, occupa tutta la finestra
            : "p-4" // Default (dimensione normale)
        } bg-gray-50 rounded-lg shadow-md transition-all duration-300 ease-in-out relative`}
      >
        <div className={`flex justify-between items-center`}>
          <h3 className="text-lg">{title}</h3>
          <div className="flex space-x-2">
            <button className="text-xl text-blue-500" onClick={toggleMinimize}>
              <FaRegWindowMinimize />
            </button>
            <button
              className="text-xl text-blue-500"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <FaTimes /> : <FaArrowsAlt />}
            </button>
          </div>
        </div>
        {!minimized && (
          <div className="p-1 w-full overflow-auto">
            {React.cloneElement(children, { filters })}
          </div>
        )}
      </div>
    );
  }
);

export default Panel;
