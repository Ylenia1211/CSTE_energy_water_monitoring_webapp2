const PdfData = require("../models/PdfData");

/**
 * Somma il costo (campo string TOT 'totale') per edificio (indirizzo) nel range date.
 * @param {Object} args
 * @param {Date|null} args.start
 * @param {Date|null} args.end
 * @returns {Promise<Array<{ building: string, totale: number, currency: 'EUR' }>>}
 */
async function getTotalCostByBuilding({ start, end }) {
  const match = {};
  if (start) match.data = { ...(match.data || {}), $gte: new Date(start) };
  if (end)   match.data = { ...(match.data || {}), $lte: new Date(end) };

  // Sanificazione 'totale' (stringa) -> numero:
  // - rimuove "€", "EUR", spazi
  // - rimuove punti (migliaia)
  // - sostituisce virgola con punto
  // - converte in double, default 0 su errori/null
  const pipeline = [
    { $match: match },
    {
      $addFields: {
        _totaleSanitized: {
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
                            replacement: ""
                          }
                        },
                        find: "EUR",
                        replacement: ""
                      }
                    },
                    find: "eur",
                    replacement: ""
                  }
                },
                find: " ",
                replacement: ""
              }
            },
            find: ".",
            replacement: ""
          }
        }
      }
    },
    {
      $addFields: {
        _totaleSanitized: {
          $replaceAll: {
            input: "$_totaleSanitized",
            find: ",",
            replacement: "."
          }
        }
      }
    },
    {
      $addFields: {
        totaleNum: {
          $convert: {
            input: "$_totaleSanitized",
            to: "double",
            onError: 0,
            onNull: 0
          }
        }
      }
    },
    {
      $group: {
        _id: "$indirizzo",
        totale: { $sum: "$totaleNum" }
      }
    },
    {
      $project: {
        _id: 0,
        building: "$_id",
        totale: { $round: ["$totale", 2] },
        currency: { $literal: "EUR" }
      }
    },
    { $sort: { building: 1 } }
  ];

  const rows = await PdfData.aggregate(pipeline).allowDiskUse(true);
  return rows; // [{ building, totale, currency }]
}

module.exports = {
  getTotalCostByBuilding
};