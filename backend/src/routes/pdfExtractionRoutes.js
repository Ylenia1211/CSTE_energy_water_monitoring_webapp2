const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const upload = multer({ dest: "uploads/" });

router.post("/extract", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    console.error("Nessun file ricevuto!");
    return res.status(400).json({ error: "Nessun file ricevuto" });
  }

  const pdfPath = req.file.path;
  console.log("File ricevuto:", pdfPath);

  const python = spawn("python3", [
    "src/python-scripts/estrai_dati.py",
    pdfPath,
  ]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    const str = data.toString();
    console.log("📤 STDOUT:", str);
    output += str;
  });

  python.stderr.on("data", (data) => {
    const str = data.toString();
    console.error("STDERR:", str);
    errorOutput += str;
  });

  python.on("close", (code) => {
    console.log("🔚 Python terminato con codice:", code);
    fs.unlink(pdfPath, () => {}); // elimina file temporaneo

    if (code !== 0) {
      return res.status(500).json({
        error: "Errore durante l'estrazione PDF",
        stderr: errorOutput,
      });
    }

    try {
      const json = JSON.parse(output);
      return res.json(json);
    } catch (err) {
      console.error("JSON.parse fallito:", err.message);
      console.log("Output ricevuto:", output);
      return res.status(500).json({ error: "Errore nel parsing JSON" });
    }
  });
});

const { savePdfData } = require("../controllers/savePdfData");
router.post("/save", savePdfData);

const PdfModel = require("../models/PdfData");
router.get("/all", async (req, res) => {
  try {
    const dati = await PdfModel.find().sort({ data: -1 }); // ordina per data decrescente
    res.json(dati);
  } catch (err) {
    console.error("Errore nel recupero dati:", err);
    res.status(500).json({ error: "Errore durante il recupero dei dati" });
  }
});

module.exports = router;
//const express = require("express");
//const multer = require("multer");
//const router = express.Router();
//const upload = multer({ dest: "uploads/" });

//const { extractPdfData } = require("../controllers/pdfExtractionController");
//router.post("/extract", upload.single("pdf"), extractPdfData);
//module.exports = router;

