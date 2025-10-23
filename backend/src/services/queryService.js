/**
 * @fileoverview
 * Questo modulo fornisce una lista di query disponibili che possono essere utilizzate per ottenere dati energetici filtrati o aggregati.
 * Ogni query è rappresentata da un oggetto con un nome e una descrizione visualizzabile.
 * La funzione principale, `getAvailableQueries`, restituisce l'elenco delle query che l'applicazione può eseguire.
 *
 * @module queryService
 */

// Dati di esempio per le query disponibili
const availableQueries = [
  {
    name: "getLiveValuesByBuilding",
    displayName: "Valori Live per Edificio",
  },
  {
    name: "getValuesByFilter",
    displayName: "Valori per Filtro",
  },
  {
    name: "getLiveValues",
    displayName: "Valori Live",
  },
  {
    name: "getTotalConsumption",
    displayName: "Consumo Totale",
  },
  {
    name: "getTotalConsumptionByBuilding",
    displayName: "Consumo Totale per Edificio",
  },
  {
    name: "getBarChartByBuilding",
    displayName: "Grafico a Barre per Edificio",
  },
  {
    name: "getInfoMeters",
    displayName: "Informazioni sui Contatori",
  },
  {
    name: "getNestedFields",
    displayName: "Campi Annidati",
  },
  {
    name: "getWeeklyConsumptionByDay",
    displayName: "Consumo Settimanale per Giorno",
  },
];

/**
 * Restituisce l'elenco delle query disponibili che possono essere utilizzate nell'applicazione.
 * Ogni query è rappresentata da un oggetto contenente il nome della query e il suo nome visualizzabile.
 *
 * @function getAvailableQueries
 * @returns {Array} Un array di oggetti, ciascuno con una proprietà `name` (nome della query) e `displayName` (nome visualizzabile della query).
 */
const getAvailableQueries = () => {
  return availableQueries;
};

module.exports = {
  getAvailableQueries,
};
