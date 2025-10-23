/**
 * @fileoverview
 * Questo modulo gestisce la generazione e l'esportazione di file PDF. La funzione principale `generatePDF` accetta i dati tramite una richiesta HTTP,
 * genera un file PDF utilizzando un servizio esterno, e lo invia come risposta per il download.
 *
 * @module exportPDFController
 */

const exportPDFService = require("../services/exportPDFService");

/**
 * Funzione che genera un file PDF e lo invia come risposta HTTP per il download.
 *
 * @async
 * @function generatePDF
 * @param {Object} req - Oggetto della richiesta HTTP, che contiene il titolo del PDF e le sezioni da includere nel documento.
 * @param {Object} res - Oggetto della risposta HTTP, utilizzato per inviare il file PDF al client.
 * @throws {Error} Lancia un errore se si verifica un problema nella generazione del PDF.
 * @returns {void}
 */
const generatePDF = async (req, res) => {
  try {
    // Estrae il titolo e le sezioni dal corpo della richiesta
    const { title, sections } = req.body;

    // Genera il PDF utilizzando il servizio esterno
    const pdfBuffer = await exportPDFService.createPDF(title, sections);

    // Log per il debug (opzionale)
    console.log("Buffer PDF generato, lunghezza:", pdfBuffer.length);
    console.log("Buffer PDF tipo:", Buffer.isBuffer(pdfBuffer));

    // Imposta gli header per il download del file PDF
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");

    // Invia il PDF al client
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Errore nella generazione del PDF:", error);
    res.status(500).json({ error: "Errore nella generazione del PDF" });
  }
};

module.exports = {
  generatePDF,
};
