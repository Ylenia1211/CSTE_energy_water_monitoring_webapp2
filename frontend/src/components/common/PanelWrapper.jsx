/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `PanelWrapper`, che gestisce una serie di pannelli
 * interattivi (del tipo `Panel`). Ogni pannello può essere visualizzato in modalità normale
 * o espanso a schermo intero. Il componente gestisce lo stato di visualizzazione dei pannelli,
 * permettendo di passare dalla modalità finestra alla modalità fullscreen.
 *
 * @module PanelWrapper
 */

import React, { useState } from "react";
import Panel from "./Panel";

/**
 * Componente `PanelWrapper` che gestisce una collezione di pannelli, ognuno dei quali può essere
 * visualizzato in modalità normale o a schermo intero. Gestisce anche la logica per il passaggio
 * alla modalità fullscreen e il ritorno alla modalità finestra.
 *
 * @component
 * @example
 * // Esempio di utilizzo del componente
 * <PanelWrapper
 *   panels={[
 *     { title: "Pannello 1", content: <div>Contenuto del pannello 1</div> },
 *     { title: "Pannello 2", content: <div>Contenuto del pannello 2</div> },
 *   ]}
 * />
 *
 * @param {Array} panels - Una lista di oggetti che rappresentano i pannelli da visualizzare.
 * Ogni oggetto deve contenere una proprietà `title` per il titolo del pannello e una proprietà `content` per il contenuto.
 *
 * @returns {JSX.Element} Un wrapper per visualizzare i pannelli in modalità finestra o fullscreen.
 */
const PanelWrapper = ({ panels }) => {
  const [fullscreenPanelId, setFullscreenPanelId] = useState(null);

  // Funzione per gestire l'ingresso e l'uscita dalla modalità "fullscreen"
  const handleFullscreenToggle = (panelId) => {
    if (fullscreenPanelId === panelId) {
      // Se il pannello è già in modalità "fullscreen", esci da essa
      setFullscreenPanelId(null);
    } else {
      // Altrimenti, metti il pannello in modalità "fullscreen"
      setFullscreenPanelId(panelId);
    }
  };

  return (
    <div className="relative flex flex-wrap gap-4 p-4 w-full h-full bg-gray-100">
      {/* Pannelli normali (quando non sono in modalità fullscreen) */}
      <div
        className={`flex flex-col gap-2 ${
          fullscreenPanelId != null ? "hidden" : ""
        }`}
        style={{ width: "100%", height: "100%" }}
      >
        {panels.map((panel, index) => (
          <div
            key={index}
            className={`flex-grow basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/2 xl:basis-1/3 2xl:basis-1/3 max-w-full sm:max-w-1/2 md:max-w-1/3 lg:max-w-1/3 xl:max-w-1/3 2xl:max-w-1/4 text-center`}
            style={{
              flexShrink: 0, // Evita che i pannelli si restringano oltre il loro contenuto
              minWidth: 0, // Necessario per evitare problemi di overflow
              height: "auto", // Gestisce la variabilità in altezza
            }}
          >
            <Panel
              panelId={index}
              title={panel.title}
              onFullscreenToggle={handleFullscreenToggle}
              isFullscreen={fullscreenPanelId === index}
            >
              {/* Contenuto del pannello */}
              {panel.content}
            </Panel>
          </div>
        ))}
      </div>

      {/* Modalità fullscreen */}
      {fullscreenPanelId != null && (
        <div className="w-full h-full bg-opacity-75 flex justify-center items-center">
          <Panel
            panelId={fullscreenPanelId}
            title={panels[fullscreenPanelId].title}
            onFullscreenToggle={handleFullscreenToggle}
            isFullscreen={true}
            isMinimized={false}
          >
            {/* Contenuto del pannello fullscreen */}
            {panels[fullscreenPanelId].content}
          </Panel>
        </div>
      )}
    </div>
  );
};

export default PanelWrapper;
