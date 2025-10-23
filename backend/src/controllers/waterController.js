// controllers/waterController.js
const PdfModel = require("../models/PdfData");

exports.getTotalWaterConsumption = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Parametri start ed end obbligatori" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const docs = await PdfModel.find({
      data: { $gte: startDate, $lte: endDate },
      consumo: { $ne: "" },
    });

    const total = docs.reduce((acc, doc) => {
      const consumo = parseFloat(doc.consumo.replace(",", "."));
      return acc + (isNaN(consumo) ? 0 : consumo);
    }, 0);

    res.json({
      startDate,
      endDate,
      totalConsumption: total,
      unit: "m³",
    });
  } catch (err) {
    console.error("Errore totale consumo:", err);
    res.status(500).json({ error: "Errore interno", details: err.message });
  }
};


exports.getWaterConsumptionByBuilding = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Start e end sono obbligatori" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const records = await PdfModel.find({
      data: { $gte: startDate, $lte: endDate },
      consumo: { $ne: "" },
    });

    // Mappa per aggregare i consumi per indirizzo (edificio)
    const buildingMap = new Map();

    records.forEach((doc) => {
      const building = doc.indirizzo || "Edificio sconosciuto";
      const consumo = parseFloat(doc.consumo.replace(",", ".")) || 0;

      if (buildingMap.has(building)) {
        buildingMap.get(building).consumo += consumo;
      } else {
        buildingMap.set(building, { building, consumo, unit: "m³" });
      }
    });

    const consumptionByBuilding = Array.from(buildingMap.values());

    res.json({
      startDate,
      endDate,
      consumptionByBuilding,
    });
  } catch (err) {
    console.error("Errore:", err);
    res.status(500).json({ error: "Errore interno", details: err.message });
  }
};