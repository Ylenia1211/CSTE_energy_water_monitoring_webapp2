/**
 * @namespace services
 * @fileoverview
 * Questo modulo permette creazione sul server di file (immagini) ricevute dal client.
 * @module fileService
 */

/**
 * Elabora il file caricato e restituisce alcune informazioni su di esso.
 *
 * @param {Object} file - Il file caricato tramite la richiesta (ad esempio, da un middleware di caricamento file).
 * @param {string} file.originalname - Il nome originale del file caricato.
 * @param {string} file.mimetype - Il tipo MIME del file (es. "image/jpeg", "application/pdf").
 * @param {number} file.size - La dimensione del file in byte.
 * @returns {Object} Un oggetto contenente le informazioni sul file elaborato.
 * @property {string} originalName - Il nome originale del file.
 * @property {string} mimeType - Il tipo MIME del file.
 * @property {number} size - La dimensione del file in byte.
 */
const processFile = (file) => {
  // Logica per elaborare il file
  console.log("File elaborato:", file);
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
};

module.exports = {
  processFile,
};
