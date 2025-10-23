// controllers/waterCost.controller.js
const PdfData = require("../models/PdfData");

/**
 * Controller per ottenere il costo totale per edificio (indirizzo)
 * tra due date, leggendo dalla collection "bills_water_sintetico".
 *
 * Campo usato per somma: "totale" (stringa con €, spazi, virgole, ecc.)
 * Campo edificio: "indirizzo"
 */
async function totalCostByBuildingController(req, res, next) {
  try {
    const { start, end } = req.query;

    // Validazione e parsing date
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    if (start && isNaN(startDate)) {
      return res.status(400).json({ message: "Parametro 'start' non valido (atteso ISO)." });
    }
    if (end && isNaN(endDate)) {
      return res.status(400).json({ message: "Parametro 'end' non valido (atteso ISO)." });
    }

    const match = {};
    if (startDate) match.data = { ...(match.data || {}), $gte: startDate };
    if (endDate) match.data = { ...(match.data || {}), $lte: endDate };

    // Pipeline di aggregazione MongoDB
    const pipeline = [
      { $match: match },
      // Pulizia campo "totale" (stringa) → numero
      {
        $addFields: {
          totalePulito: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: { $trim: { input: "$totale" } },
                              find: "€",
                              replacement: "",
                            },
                          },
                          find: "EUR",
                          replacement: "",
                        },
                      },
                      find: "eur",
                      replacement: "",
                    },
                  },
                  find: " ",
                  replacement: "",
                },
              },
              find: ".",
              replacement: "",
            },
          },
        },
      },
      {
        $addFields: {
          totalePulito: {
            $replaceAll: {
              input: "$totalePulito",
              find: ",",
              replacement: ".",
            },
          },
        },
      },
      {
        $addFields: {
          totaleNum: {
            $convert: {
              input: "$totalePulito",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$indirizzo",
          totale: { $sum: "$totaleNum" },
        },
      },
      {
        $project: {
          _id: 0,
          building: "$_id",
          totale: { $round: ["$totale", 2] },
          currency: { $literal: "EUR" },
        },
      },
      { $sort: { building: 1 } },
    ];

    const result = await PdfData.aggregate(pipeline).allowDiskUse(true);

    return res.json({
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      costByBuilding: result,
    });
  } catch (error) {
    console.error("Errore nel controller totalCostByBuilding:", error);
    next(error); // delega all'error handler globale
  }
}

module.exports = { totalCostByBuildingController };
