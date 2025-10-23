/**
 * @namespace pages
 * @fileoverview
 * Il file contiene un componente React per la configurazione di un report personalizzato in formato PDF.
 * L'utente può aggiungere, modificare e rimuovere diverse sezioni, come tabelle, grafici e testo personalizzato.
 * Ogni sezione può essere configurata con specifici parametri, come la query per le tabelle, l'anteprima dei grafici e la personalizzazione del testo.
 * Inoltre, l'utente può spostare le sezioni tramite drag-and-drop e generare il report in formato PDF.
 *
 * Le funzionalità principali includono:
 * - Aggiunta e configurazione di sezioni del report (grafico o  testo).
 * - Creazione e visualizzazione di grafici tramite un componente esterno.
 * - Modifica delle sezioni già aggiunte.
 * - Generazione di un report in formato PDF.
 *
 * @module ReportConfigurator
 */

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import DraggableSection from "../components/common/DraggableSection";
import ChartReportSelector from "../components/common/ChartReportSelector";

import { exportQueryDataToPDF } from "../utils/exportAPI";
import { uploadImage } from "../utils/filesAPI";

/**
 * @component
 * Componente per la configurazione di un report personalizzato.
 * Permette agli utenti di aggiungere, modificare e rimuovere sezioni come tabelle, grafici e testo personalizzato.
 * Gestisce la logica per la selezione delle query, la configurazione dinamica delle sezioni e la generazione del PDF.
 *
 * @function ReportConfigurator
 * @returns {JSX.Element} Il componente di configurazione del report.
 */
const ReportConfigurator = () => {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    type: "",
    config: {},
  });
  const [showIndicator, setShowIndicator] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState(null);
  const chartRef = useRef();
  const [editingIndex, setEditingIndex] = useState(null);

  const [seletedChartDescription, setseletedChartDescription] = useState({});
  /**
   * Funzione per aggiornare i dati per la descrizione del grafico selezionato.
   * @function handleGetDescription
   * @param {Object} description La descrizione del grafico selezionato.
   * @returns {void}
   */
  const handleGetDescription = (description) => {
    setseletedChartDescription(description);
  };

  /**
   * Funzione per convertire un'immagine in formato DataURL in un oggetto Blob.
   * @function dataURItoBlob
   * @param {string} dataURI La stringa DataURL dell'immagine.
   * @returns {Blob} L'oggetto Blob risultante.
   */
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  /**
   * Funzione per aggiungere una nuova sezione al report.
   * La sezione può essere di tipo 'chart' o 'text'. Se la sezione è di tipo grafico, viene creato un canvas
   * e l'immagine risultante viene caricata su un server.
   * @function addSection
   * @returns {void}
   */
  const addSection = async () => {
    if (!currentSection.type) return;

    //Se le sezione da aggiungere è di tipo chart
    if (currentSection.type === "chart") {
      const chartElement =
        chartRef.current.querySelector("canvas") || chartRef.current;

      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            useCORS: true,
            scale: 3,
            backgroundColor: null,
          });

          const chartImage = canvas.toDataURL("image/png");
          const imageBlob = dataURItoBlob(chartImage);

          const response = await uploadImage(imageBlob);

          if (response && response.fileUrl) {
            setSections([
              ...sections,
              {
                ...currentSection,
                config: {
                  ...currentSection.config,
                  chartImageUrl: response.fileUrl,
                  chartDescription: seletedChartDescription,
                },
              },
            ]);
          } else {
            console.error(
              "Errore nell'upload dell'immagine o fileUrl mancante"
            );
          }
        } catch (error) {
          console.error("Errore durante la creazione del canvas:", error);
        }
      } else {
        console.error("Elemento canvas non trovato");
      }
    } else {
      setSections([...sections, currentSection]);
    }

    setCurrentSection({ type: "", config: {} });
    setseletedChartDescription({});
  };

  /**
   * Funzione per rimuovere una sezione dal report in base al suo indice.
   * @function removeSection
   * @param {number} index L'indice della sezione da rimuovere.
   * @returns {void}
   */
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  /**
   * Funzione per spostare una sezione nella lista in base agli indici di partenza e destinazione.
   * @function moveSection
   * @param {number} fromIndex L'indice di partenza della sezione.
   * @param {number} toIndex L'indice di destinazione della sezione.
   * @returns {void}
   */
  const moveSection = (fromIndex, toIndex) => {
    const updatedSections = [...sections];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);
    setSections(updatedSections);
    setShowIndicator(false);
  };

  /**
   * Funzione per gestire l'evento di entrata nel drag, mostrando l'indicatore di posizione.
   * @function handleDragEnter
   * @param {number} index L'indice della sezione in cui è stato effettuato l'entrata del drag.
   * @returns {void}
   */
  const handleDragEnter = (index) => {
    setShowIndicator(true);
    setIndicatorPosition(index);
  };

  /**
   * Funzione per gestire l'evento di uscita del drag, nascondendo l'indicatore di posizione.
   * @function handleDragLeave
   * @returns {void}
   */
  const handleDragLeave = () => {
    setShowIndicator(false);
    setIndicatorPosition(null);
  };

  /**
   * Funzione per generare il report in formato PDF.
   * @function generatePDF
   * @returns {Promise<void>}
   */
  const generatePDF = async () => {
    try {
      await exportQueryDataToPDF(title, sections);
    } catch (error) {
      console.error("Errore nella generazione del PDF:", error);
    }
  };

  /**
   * Funzione per avviare la modifica di una sezione esistente.
   * @function editSection
   * @param {number} index L'indice della sezione da modificare.
   * @returns {void}
   */
  const editSection = (index) => {
    setEditingIndex(index);
    setCurrentSection(sections[index]);
  };

  /**
   * Funzione per salvare le modifiche apportate a una sezione esistente.
   * Se la sezione è di tipo 'chart', aggiorna l'immagine del grafico.
   * @function saveEditedSection
   * @returns {void}
   */
  const saveEditedSection = async () => {
    if (editingIndex !== null) {
      const updatedSections = [...sections];

      // Se la sezione modificata è di tipo "chart"
      if (currentSection.type === "chart") {
        const chartElement =
          chartRef.current.querySelector("canvas") || chartRef.current;

        if (chartElement) {
          try {
            // Crea un'immagine dal contenuto del canvas
            const canvas = await html2canvas(chartElement, {
              useCORS: true,
              scale: 3,
              backgroundColor: null,
            });

            const chartImage = canvas.toDataURL("image/png");
            const imageBlob = dataURItoBlob(chartImage);

            // Carica l'immagine
            const response = await uploadImage(imageBlob);

            if (response && response.fileUrl) {
              // Aggiorna l'URL dell'immagine nella sezione esistente
              updatedSections[editingIndex] = {
                ...currentSection,
                config: {
                  ...currentSection.config,
                  chartImageUrl: response.fileUrl,
                },
              };

              setSections(updatedSections);
              setEditingIndex(null);
              setCurrentSection({ type: "", config: {} });
            } else {
              console.error(
                "Errore nell'upload dell'immagine o fileUrl mancante"
              );
            }
          } catch (error) {
            console.error("Errore durante la creazione del canvas:", error);
          }
        } else {
          console.error("Elemento canvas non trovato");
        }
      } else {
        // Se non è un grafico, salva la sezione modificata direttamente
        updatedSections[editingIndex] = currentSection;
        setSections(updatedSections);
        setEditingIndex(null);
        setCurrentSection({ type: "", config: {} });
      }
    }
  };

  /**
   * Funzione per annullare la modifica di una sezione.
   * @function cancelEdit
   * @returns {void}
   */
  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentSection({ type: "", config: {} });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 min-h-screen">
        <h1 className="text-3xl text-white mb-6">
          Creazione Report Personalizzato PDF
        </h1>
        {/* Titolo Report */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <label className="block text-xl mb-2">
            Titolo del report
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Inserisci il titolo del report"
          />
        </div>
        {/* Selezione Tipo Sezione */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-xl mb-4">Aggiungi una sezione</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Titolo della sezione
            </label>
            <input
              type="text"
              value={currentSection.config.title || ""}
              placeholder="Inserisci il titolo della sezione"
              onChange={(e) =>
                setCurrentSection({
                  ...currentSection,
                  config: {
                    ...currentSection.config,
                    title: e.target.value,
                  },
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <label className="block text-gray-700 font-medium mb-2">
            Scegli il tipo di sezione
          </label>
          <select
            value={currentSection.type}
            onChange={(e) =>
              setCurrentSection({ ...currentSection, type: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Seleziona tipo di sezione</option>
            <option value="chart">Grafico</option>
            <option value="text">Testo Personalizzato</option>
          </select>

          {/* Configurazione Dinamica */}
          {currentSection.type === "chart" && (
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-2">
                Visualizza anteprima del grafico
              </label>
              <div ref={chartRef}>
                <ChartReportSelector getDescription={handleGetDescription} />
              </div>
            </div>
          )}

          {currentSection.type === "text" && (
            <div className="mt-4">
              <div className="flex flex-col mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Scegli la dimensione
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  placeholder="16"
                  className="mb-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) =>
                    setCurrentSection({
                      ...currentSection,
                      config: {
                        ...currentSection.config,
                        fontSize: Number(e.target.value),
                      },
                    })
                  }
                />

                <label className="block text-gray-700 font-medium mb-2">
                  Scegli il colore
                </label>
                <input
                  type="color"
                  className="mb-2 border border-gray-300 rounded-lg"
                  onChange={(e) =>
                    setCurrentSection({
                      ...currentSection,
                      config: {
                        ...currentSection.config,
                        color: e.target.value,
                      },
                    })
                  }
                />

                <label className="block text-gray-700 font-medium mb-2">
                  Scegli lo stile
                </label>
                <select
                  className="mb-4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) =>
                    setCurrentSection({
                      ...currentSection,
                      config: {
                        ...currentSection.config,
                        fontStyle: e.target.value,
                      },
                    })
                  }
                >
                  <option value="normal">Normale</option>
                  <option value="italic">Corsivo</option>
                  <option value="bold">Grassetto</option>
                  <option value="underline">Sottolineato</option>
                </select>
              </div>

              <label className="block text-gray-700 font-medium mb-2">
                Anteprima Testo
              </label>
              <textarea
                rows="4"
                placeholder="Inserisci il testo"
                onChange={(e) =>
                  setCurrentSection({
                    ...currentSection,
                    config: {
                      ...currentSection.config,
                      text: e.target.value,
                    },
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{
                  fontFamily: currentSection.config.font,
                  fontSize: currentSection.config.fontSize + "px",
                  color: currentSection.config.color,
                  fontStyle:
                    currentSection.config.fontStyle === "italic"
                      ? "italic"
                      : "normal",
                  fontWeight:
                    currentSection.config.fontStyle === "bold"
                      ? "bold"
                      : "normal",
                  textDecoration:
                    currentSection.config.fontStyle === "underline"
                      ? "underline"
                      : "none",
                }}
              ></textarea>
            </div>
          )}

          {editingIndex !== null && (
            <div className="p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Modifica Sezione</h2>

              <button
                onClick={saveEditedSection}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Salva Modifiche
              </button>
              <button
                onClick={cancelEdit}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Annulla
              </button>
            </div>
          )}

          <button
            onClick={addSection}
            className="mt-4 bg-indigo-900 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg"
          >
            Aggiungi sezione
          </button>
        </div>
        {/* Lista delle sezioni */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl mb-4">Sezioni Aggiunte</h2>
          {sections.length > 0 ? (
            <ul className="space-y-4">
              {sections.map((section, index) => (
                <DraggableSection
                  key={index}
                  section={section}
                  index={index}
                  moveSection={moveSection}
                  removeSection={removeSection}
                  showIndicator={showIndicator}
                  indicatorPosition={indicatorPosition}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  editSection={editSection}
                />
              ))}
            </ul>
          ) : (
            <p>Nessuna sezione aggiunta.</p>
          )}
        </div>
        {/* Bottoni per generare il PDF */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={generatePDF}
            className="bg-indigo-900 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg"
          >
            Genera PDF
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default ReportConfigurator;
