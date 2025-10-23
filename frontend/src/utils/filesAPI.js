/**
 * @namespace utils
 * @fileoverview
 * Questo modulo contiene le funzioni per la gestione del caricamento di file e immagini
 * sul server, utilizzando richieste HTTP. Le funzioni principali includono:
 *
 * 1. **uploadImage**: Carica un'immagine sul server e restituisce l'URL dell'immagine caricata.
 *
 * Ogni funzione interagisce con l'API del server per inviare dati (come immagini) tramite
 * il metodo POST, utilizzando il tipo di contenuto `multipart/form-data`.
 *
 * La documentazione specifica anche i possibili errori che potrebbero verificarsi durante
 * la comunicazione con il server e fornisce esempi su come gestirli.
 *
 * @module fileAPI
 * @requires axiosInstance
 *
 */

// Il codice del modulo continua qui sotto

import axiosInstance from "./api";

const BASE_API = "/files";

/**
 * Carica un'immagine sul server.
 *
 * Questa funzione invia l'immagine al server utilizzando una richiesta HTTP POST con un oggetto FormData.
 * L'immagine viene inviata come parte di un modulo multipart/form-data. Se la richiesta ha successo,
 * la risposta contiene l'URL dell'immagine caricata.
 *
 * @param {File} imageData - Il file immagine da caricare (tipo `File` di JavaScript).
 * @returns {Promise<Object>} Una promessa che restituisce un oggetto contenente l'URL dell'immagine caricata.
 *
 * @throws {Error} Se si verifica un errore durante il caricamento dell'immagine o se la connessione al server fallisce.
 *
 * @example
 * const imageFile = document.querySelector('input[type="file"]').files[0];
 * uploadImage(imageFile)
 *   .then(data => {
 *     console.log('Immagine caricata con successo:', data.url);
 *   })
 *   .catch(error => {
 *     console.error('Errore durante il caricamento dell\'immagine:', error.message);
 *   });
 */
export const uploadImage = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append("image", imageData);

    const response = await axiosInstance.post(
      `${BASE_API}/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // risposta deve contenere l'URL dell'immagine
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Errore sconosciuto");
    }
    throw new Error("Errore di connessione al server");
  }
};
