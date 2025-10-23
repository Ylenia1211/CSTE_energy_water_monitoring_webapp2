/**
 * @namespace services
 * @fileoverview
 * Questo modulo permette la generazione dinamica di documenti PDF utilizzando la libreria PDFKit,
 * con supporto per sezioni di testo, grafici e pagine multiple.
 * @module exportExcelService
 */

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const sizeOf = require("image-size");
const moment = require("moment");

/**
 * Pulisce un oggetto rimuovendo tutte le proprietà con valori vuoti.
 *
 * @param {Object} params - L'oggetto da pulire.
 * @returns {Object} - L'oggetto pulito.
 */
const cleanParams = (params) => {
  if (typeof params !== "object" || params === null) {
    // Se `params` non è un oggetto valido, restituisci un oggetto vuoto
    return {};
  }

  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          // Se il valore è un oggetto, chiama ricorsivamente `cleanParams`
          const cleanedValue = cleanParams(value);
          return [key, cleanedValue];
        }
        return [key, value];
      })
      .filter(([key, value]) => {
        if (typeof value === "string") {
          return value.trim() !== ""; // Mantieni solo se la stringa non è vuota
        }
        if (Array.isArray(value)) {
          return value.length > 0; // Mantieni solo se l'array non è vuoto
        }
        if (typeof value === "object" && value !== null) {
          return Object.keys(value).length > 0; // Mantieni solo se l'oggetto non è vuoto
        }
        return value !== undefined && value !== null; // Mantieni solo se il valore è definito e non null
      })
  );
};

/**
 * Crea un documento PDF con un titolo e un array di sezioni.
 * Ogni sezione può essere di tipo "text", "table" o "chart".
 *
 * @param {string} title - Il titolo del PDF.
 * @param {Array} sections - Un array di sezioni da aggiungere al PDF.
 * @returns {Promise<Buffer>} - Una Promise che restituisce il PDF come Buffer.
 */
const createPDF = async (title, sections) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.addPage();
      doc
        .fontSize(24)
        .fillColor("black")
        .text(title || `Report dei consumi - ${new Date().toLocaleString()}`, {
          align: "center",
        });
      doc.moveDown(1);

      sections.forEach((section, index) => {
        try {
          console.log(`\nElaborazione della sezione ${index + 1}:`, section);
          const currentY = doc.y;
          console.log(
            `Posizione Y corrente prima di elaborare la sezione: ${currentY}`
          );

          if (
            index > 0 &&
            (section.forceNewPage || shouldStartNewPage(doc, section))
          ) {
            console.log("Aggiunta nuova pagina per la sezione:", index + 1);
            doc.addPage();
          }

          doc
            .fontSize(18)
            .fillColor("black")
            .text(
              `${section.config.title || `Sezione ${index + 1}`}${
                section.config.chartDescription &&
                section.config.chartDescription.title
                  ? `: ${section.config.chartDescription.title}`
                  : ""
              }`,
              { underline: true }
            );

          // Aggiungi la sezione specifica
          switch (section.type) {
            case "text":
              addTextSection(doc, section.config);
              break;
            case "table":
              // addTableSection(doc, section.config);
              break;
            case "chart":
              addChartSection(doc, section.config);
              break;
            default:
              doc.fontSize(12).text("Tipo di sezione non supportato.");
              console.log(`Tipo di sezione non supportato: ${section.type}`);
          }

          const newY = doc.y;
          doc.moveDown(1);
          console.log(`Posizione Y dopo la sezione ${index + 1}: ${newY}`);
        } catch (error) {
          console.error(`Errore nella sezione ${index + 1}:`, error);
        }
      });

      doc.end();
      console.log("PDF creato con successo.");
    } catch (error) {
      console.error("Errore nella creazione del PDF:", error);
      reject(error);
    }
  });
};

/**
 * Determina se è necessario iniziare una nuova pagina nel PDF.
 *
 * @param {PDFDocument} doc - L'oggetto PDFKit.
 * @param {Object} section - La sezione da aggiungere.
 * @returns {boolean} - Restituisce `true` se una nuova pagina deve essere aggiunta, altrimenti `false`.
 */
const shouldStartNewPage = (doc, section) => {
  const pageHeight = doc.page.height;
  const currentY = doc.y;
  console.log(
    `Posizione Y corrente: ${currentY}, Altezza della pagina: ${pageHeight}`
  );

  const estimatedSectionHeight = estimateSectionHeight(section);
  console.log(`Altezza stimata della sezione: ${estimatedSectionHeight}`);

  // Verifica se la sezione può stare nella pagina corrente
  if (currentY + estimatedSectionHeight > pageHeight) {
    console.log(
      "Spazio insufficiente per la sezione, aggiunta di una nuova pagina."
    );
    return true;
  }
  return false;
};

/**
 * Stima l'altezza di una sezione per determinare se è necessaria una nuova pagina.
 *
 * @param {Object} section - La sezione da stimare.
 * @returns {number} - L'altezza stimata della sezione in punti.
 */
const estimateSectionHeight = (section) => {
  switch (section.type) {
    case "text":
      const textHeight = section.config.text.split("\n").length * 15 + 20;
      console.log(`Altezza stimata per il testo: ${textHeight}`);
      return textHeight;
    case "chart":
      const chartHeight = 350 + 20;
      console.log(`Altezza stimata per il grafico: ${chartHeight}`);
      return chartHeight;
    default:
      console.log(`Altezza stimata minima per una sezione non supportata: 50`);
      return 50;
  }
};

/**
 * Aggiunge una sezione di testo al documento PDF.
 *
 * @param {PDFDocument} doc - L'oggetto PDFKit.
 * @param {Object} config - La configurazione della sezione di testo.
 * @param {string} config.text - Il testo da aggiungere.
 * @param {number} [config.fontSize=12] - La dimensione del font.
 * @param {string} [config.color='black'] - Il colore del testo.
 * @param {string} [config.fontStyle=''] - Lo stile del font, ad esempio "bold", "italic", "underline".
 * @param {string} [config.textAlign='left'] - L'allineamento del testo (left, right, center, justify).
 * @throws {Error} - Se ci sono errori nei parametri.
 */
const addTextSection = (doc, config) => {
  const {
    text,
    fontSize = 12,
    color = "black",
    fontStyle = "",
    textAlign = "left",
  } = config;

  console.log("Config della sezione di testo:", config);

  if (isNaN(fontSize) || fontSize <= 0) {
    throw new Error(
      `fontSize deve essere un numero positivo valido. Ricevuto: ${fontSize}`
    );
  }

  if (typeof text !== "string") {
    throw new Error(
      `Il testo deve essere una stringa valida. Ricevuto: ${text}`
    );
  }

  if (typeof color !== "string") {
    throw new Error(`Color deve essere una stringa valida. Ricevuto: ${color}`);
  }

  try {
    doc.fontSize(fontSize).fillColor(color);
  } catch (error) {
    throw new Error(
      `Errore nell'impostazione di fontSize, font, o color: ${error.message}`
    );
  }

  if (fontStyle.includes("bold")) {
    doc.font("Helvetica-Bold");
  }
  if (fontStyle.includes("italic")) {
    doc.font("Helvetica-Oblique");
  }
  if (fontStyle.includes("underline")) {
    doc.underline();
  }

  try {
    console.log("Aggiunta del testo alla sezione.");
    doc.text(text, {
      align: textAlign,
      lineBreak: true,
    });
  } catch (error) {
    throw new Error(
      `Errore nell'aggiungere il testo alla sezione: ${error.message}`
    );
  }

  doc.font("Helvetica"); // Ripristina lo stile di default
  console.log("Sezione di testo aggiunta con successo.");
};

/**
 * Aggiunge una sezione di grafico al documento PDF.
 *
 * @param {PDFDocument} doc - L'oggetto PDFKit.
 * @param {Object} config - La configurazione della sezione di grafico.
 * @param {Object} [config.chartDescription] - La descrizione del grafico.
 * @param {string} [config.chartDescription.title] - Il titolo del grafico.
 * @param {string} [config.chartImageUrl] - Il percorso dell'immagine del grafico.
 * @throws {Error} - Se ci sono errori nell'aggiungere l'immagine del grafico.
 */
const addChartSection = (doc, config) => {
  if (config && config.chartDescription) {
    const chartDescription = config.chartDescription;

    // Descrizione del grafico
    const title = chartDescription.title || "";
    const startDate = chartDescription.startDate
      ? moment(chartDescription.startDate).format("DD/MM/YYYY HH:mm")
      : "Non specificata";
    const endDate = chartDescription.endDate
      ? moment(chartDescription.endDate).format("DD/MM/YYYY HH:mm")
      : "Non specificata";
    const buildings =
      chartDescription.filters.buildings.length > 0
        ? chartDescription.filters.buildings.join(", ")
        : "Nessun edificio selezionato";
    const plants =
      chartDescription.filters.impianti.length > 0
        ? chartDescription.filters.impianti.join(", ")
        : "Nessun impianto selezionato";

    // Creazione della descrizione dettagliata
    const descriptionText = `
      Periodo: dal ${startDate} al ${endDate}
      Filtri applicati:
      - Edifici: ${buildings}
      - Impianti: ${plants}
    `;

    // Aggiungi la descrizione al PDF
    try {
      doc
        .fontSize(16)
        .fillColor("black")
        .text(descriptionText, { align: "left", lineGap: 4 });

      // Spaziatura dopo la descrizione
      doc.moveDown(1); // Aggiunge uno spazio dopo la descrizione
    } catch (error) {
      console.error("Errore nell'aggiungere la descrizione al PDF:", error);
      doc
        .fontSize(12)
        .fillColor("black")
        .text("Errore nell'aggiungere la descrizione del grafico.", {
          align: "center",
          italic: true,
        });
    }
  } else {
    console.log(
      "Descrizione del grafico non implementata: nessuna descrizione fornita."
    );
    doc
      .fontSize(12)
      .fillColor("black")
      .text("Descrizione del grafico non disponibile.", {
        align: "center",
        italic: true,
      });
  }

  if (config && config.chartImageUrl) {
    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(config.chartImageUrl)
    );
    console.log("Percorso dell'immagine del grafico:", filePath);

    try {
      const imageSize = getImageSize(filePath);
      console.log("Dimensioni originali dell'immagine:", imageSize);
      const maxWidth = 500;
      const maxHeight = 350;
      let width = imageSize.width;
      let height = imageSize.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(width / aspectRatio);
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = Math.round(height * aspectRatio);
        }
      }

      console.log("Dimensioni finali per l'immagine:", { width, height });

      if (doc.y + height > doc.page.height) {
        console.log(
          "Spazio insufficiente per l'immagine, aggiunta di una nuova pagina."
        );
        doc.addPage();
      }

      doc.image(filePath, {
        width,
        height,
        align: "center",
        valign: "center",
      });

      // Aggiorna manualmente doc.y dopo l'inserimento dell'immagine
      doc.y += height; // Sposta la posizione `y` per il prossimo contenuto

      console.log("Grafico aggiunto con successo.");
    } catch (error) {
      console.error("Errore nell'aggiungere l'immagine al PDF:", error);
      doc
        .fontSize(12)
        .fillColor("black")
        .text("Errore nell'aggiungere il grafico.", {
          align: "center",
          italic: true,
        });
    }
  } else {
    console.log("Grafico non implementato: nessuna immagine fornita.");
    doc
      .fontSize(12)
      .fillColor("black")
      .text("Grafico non implementato: aggiungi un grafico qui.", {
        align: "center",
        italic: true,
      });
  }
};

/**
 * Ottiene le dimensioni di un'immagine dal percorso specificato.
 *
 * @param {string} filePath - Il percorso dell'immagine.
 * @returns {Object} - Un oggetto contenente le dimensioni dell'immagine (`width` e `height`).
 */
const getImageSize = (filePath) => {
  return sizeOf(filePath);
};

module.exports = {
  createPDF,
};
