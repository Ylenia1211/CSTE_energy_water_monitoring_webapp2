const PdfModel = require("../models/PdfData");

exports.savePdfData = async (req, res) => {
  try {
    const { totale, indirizzo, letture, file_pdf, periodo, sub_folder } = req.body;

    if (!totale || !indirizzo || !Array.isArray(letture) || letture.length === 0) {
      return res.status(400).json({ error: "Dati non validi" });
    }

    const documenti = letture.map((lettura) => {
      let dataISO = null;

      if (lettura.data && /^\d{2}\/\d{2}\/(\d{2}|\d{4})$/.test(lettura.data)) {
          const [dd, mm, yyOrYYYY] = lettura.data.split("/");

          // Se anno a 2 cifre → converto in 2000+yy
          const yyyy = yyOrYYYY.length === 2 ? `20${yyOrYYYY}` : yyOrYYYY;

          const isoStr = `${yyyy}-${mm}-${dd}`;
          const parsed = new Date(isoStr);

          if (!isNaN(parsed.getTime())) {
              dataISO = parsed;
          }
      }
      return {
        indirizzo,
        totale,
        data: dataISO,
        contatore: lettura.contatore,
        lettura: lettura.lettura,
        consumo: lettura.consumo || "",
        tipo_lettura: lettura["tipo lettura"] || lettura.tipo_lettura, //  nome coerente con lo schema
        file_pdf,
        periodo,
        sub_folder,
      };
    });

    await PdfModel.insertMany(documenti);

    res.status(201).json({ message: `${documenti.length} righe salvate` });
  } catch (err) {
    console.error("Errore salvataggio MongoDB:", err);
    res.status(500).json({
    error: "Errore interno durante il salvataggio",
    details: err.message, //  mostra l'errore vero
    });
  }
};