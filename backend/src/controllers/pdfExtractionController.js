const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");



/*
exports.extractPdfData = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "File PDF mancante" });
  }

  const pdfPath = file.path;
  const scriptPath = path.join(__dirname, "../../python-scripts/estrai_dati.py");

  execFile("python3", [scriptPath, pdfPath], (error, stdout, stderr) => {
    fs.unlink(pdfPath, () => {}); // elimina file PDF dopo elaborazione

    if (error) {
      console.error("Errore script Python:", error);
      return res.status(500).json({ error: "Errore durante l'elaborazione PDF" });
    }

    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (err) {
      console.error("Errore nel parsing JSON:", err);
      res.status(500).json({ error: "Errore nel parsing dell'output Python" });
    }
  });
  };
*/





 exports.extractPdfData = (req, res) => {
  const file = req.file;
  if (!file) {
    console.error("❌ File mancante");
    return res.status(400).json({ error: "File PDF mancante" });
  }

  const pdfPath = file.path;
  const pathParts = pdfPath.split(path.sep); // usa separatore corretto cross-platform

  // Estrae solo il nome file
  const file_pdf = path.basename(pdfPath);
  // Estrae le cartelle da cui ricavare periodo e sub_folder
  const sub_folder = pathParts.at(-3) || null;  // es: "2° trimestre"
  const periodo = pathParts.at(-2) || null;     // es: "TRIMESTRE"

  const scriptPath = path.join(__dirname, "../python-scripts/estrai_dati.py");
  console.log("📍 Path script Python:", scriptPath);


  console.log("⚙️ Avvio script:", scriptPath);
  console.log("📄 PDF:", pdfPath);

  execFile("python3", [scriptPath, pdfPath], (error, stdout, stderr) => {
    fs.unlink(pdfPath, () => {}); // elimina il file dopo l’uso

    console.log("📤 STDOUT:", stdout);
    console.log("⚠️ STDERR:", stderr);
    if (error) {
      console.error("❌ Errore esecuzione Python:", error);
      return res.status(500).json({
        error: "Errore durante l'elaborazione PDF",
        stderr,
        execError: error.message,
      });
    }

    try {
      const data = JSON.parse(stdout);
      // Aggiungi i nuovi campi al risultato
      data.file_pdf = file_pdf;
      data.periodo = periodo;
      data.sub_folder = sub_folder;
      console.log("✅ JSON Parsato:", data);
      res.json(data);
    } catch (err) {
      console.error("❌ Errore nel parsing JSON:", err.message);
      console.log("📄 Output ricevuto:", stdout);
      return res.status(500).json({
        error: "Errore nel parsing dell'output Python",
        rawOutput: stdout,
        jsonError: err.message,
      });
    }
  });
};
