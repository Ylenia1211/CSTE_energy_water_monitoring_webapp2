/**
 * @fileoverview
 * Questo modulo gestisce il caricamento dei file, in particolare per le immagini dei grafici, sul server.
 * La funzione `uploadFile` si occupa di ricevere il file caricato, elaborarlo tramite il servizio `fileService`, e restituire un URL per l'accesso al file caricato.
 *
 * In caso di errore, viene restituito un messaggio appropriato al client.
 *
 * @module fileUploadController
 */

const fileService = require("../services/fileService");
const path = require("path");

/**
 * Gestisce il caricamento di un file sul server.
 * Se il file viene caricato correttamente, viene elaborato dal servizio `fileService` e restituito l'URL dell'immagine.
 * In caso di errore, viene restituito un messaggio di errore con il codice HTTP corrispondente.
 *
 * @async
 * @function uploadFile
 * @param {Object} req - La richiesta HTTP contenente il file da caricare. Il file è presente nel corpo della richiesta, sotto la proprietà `file`.
 * @param {Object} res - La risposta HTTP, utilizzata per inviare i risultati al client.
 * @returns {Object} - Un oggetto JSON che include un messaggio di successo, l'URL del file caricato e le informazioni sul file elaborato.
 * @throws {Error} - Se non viene caricato nessun file, restituisce un errore con il messaggio "Nessun file caricato".
 *                   In caso di errore durante l'elaborazione del file, restituisce un errore generico di server.
 */
const uploadFile = (req, res) => {
  try {
    // Verifica che sia stato caricato un file
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }

    // Chiama il servizio per elaborare il file caricato
    const fileInfo = fileService.processFile(req.file);

    // Crea l'URL del file caricato
    const fileUrl = path.join("/uploads", req.file.filename);

    // Restituisce una risposta con il messaggio di successo e l'URL del file
    res.status(200).json({
      message: "File caricato con successo",
      fileUrl: fileUrl,
      fileInfo: fileInfo,
    });
  } catch (error) {
    // Gestisce gli errori e restituisce un errore generico
    console.error("Errore nel controller del file:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

module.exports = {
  uploadFile,
};
