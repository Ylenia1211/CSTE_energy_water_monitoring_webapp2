const PdfData = require("../models/PdfData"); //  path corretto

exports.getWaterConsumptionByBuilding = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};

    // Solo se i parametri sono presenti
    if (startDate && endDate) {
      matchStage.data = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await PdfData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$indirizzo", // o "$building" se usi altro campo
          consumoTotale: {
            $sum: {
              $toDouble: "$consumo",
            },
          },
        },
      },
      {
        $project: {
          edificio: "$_id",
          consumo: "$consumoTotale",
          _id: 0,
        },
      },
      { $sort: { edificio: 1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Errore nella query aggregata:", err);
    res.status(500).json({ error: "Errore durante il recupero dei dati" });
  }
};
/*
exports.getWaterConsumptionByBuilding = async (req, res) => {
  try {
    const data = await PdfData.aggregate([
      {
        $match: {
          consumo: { $exists: true, $ne: null, $ne: "" }
        },
      },
      {
        $group: {
          _id: "$indirizzo",
          totaleConsumo: {
            $sum: {
              $convert: {
                input: "$consumo",
                to: "double",
                onError: 0,
                onNull: 0,
              }
            }
          }
        }
      },
      {
        $project: {
          edificio: "$_id",
          consumo: "$totaleConsumo",
          _id: 0
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    console.error("Errore nel recupero dati acqua:", err.message);
    res.status(500).json({ error: "Errore durante il recupero dei dati" });
  }
};*/
