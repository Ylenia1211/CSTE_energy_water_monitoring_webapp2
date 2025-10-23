const PdfData = require("../models/PdfData"); // 
async function getWaterConsumptionByBuilding() {
  const result = await PdfData.aggregate([
    {
      $group: {
        _id: "$indirizzo",
        totalConsumption: { $sum: { $toDouble: "$consumo" } },
      },
    },
    {
      $project: {
        _id: 0,
        building: "$_id",
        waterConsumption: "$totalConsumption",
      },
    },
    {
      $sort: { waterConsumption: -1 },
    },
  ]);

  return result;
}

module.exports = { getWaterConsumptionByBuilding };