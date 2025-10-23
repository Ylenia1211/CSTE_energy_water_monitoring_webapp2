/**
 * @fileoverview
 * Funzioni API per i consumi idrici (da PDF salvati su MongoDB)
 * Comunicazione con le API backend per ottenere i dati idrici totali e per edificio.
 */
import axiosInstance from "./api";
const API_BASE = "/api/water";
const API_BASE_COST = "/api/watercost";
/**
 * Recupera il consumo idrico totale in un intervallo di tempo.
 *
 * @param {Date|string} startDate - Data di inizio
 * @param {Date|string} endDate - Data di fine
 * @returns {Promise<Object>} Oggetto con { startDate, endDate, consumption, unit }
 */

export const fetchTotalWaterConsumption = async (startDate, endDate) => {
  const res = await fetch(
    `${API_BASE}/total-consumption?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore consumo totale idrico: ${res.status} - ${text}`);
  }

  return await res.json();
};


/**
 * Recupera il consumo idrico aggregato per edificio in un intervallo di tempo.
 *
 * @param {Date|string} startDate - Data di inizio
 * @param {Date|string} endDate - Data di fine
 * @returns {Promise<Object>} Oggetto con { startDate, endDate, consumptionByBuilding: [{ building, consumo, unit }] }
 */
export const fetchWaterConsumptionByBuilding = async (startDate, endDate) => {
  const res = await fetch(
    `${API_BASE}/total-consumption-by-building?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore consumo per edificio: ${res.status} - ${text}`);
  }

  return await res.json();
};

/**
 * Recupera il consumo idrico aggregato per edificio in un intervallo di tempo.
 *
 * @param {Date|string} [startDate] - Data di inizio (opzionale)
 * @param {Date|string} [endDate] - Data di fine (opzionale)
 * @returns {Promise<Object>} { startDate, endDate, consumptionByBuilding: [{ building, consumo, unit }] }
 */
export const fetchWaterConsumptionByBuilding2 = async (startDate, endDate) => {
  const qs = new URLSearchParams();

  if (startDate) qs.set("start", new Date(startDate).toISOString());
  if (endDate) qs.set("end", new Date(endDate).toISOString());

  const url = `${API_BASE}/total-consumption-by-building${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore consumo per edificio: ${res.status} - ${text}`);
  }

  return await res.json();
};


export const fetchWaterCostByBuilding = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start = new Date(startDate).toISOString();
  if (endDate) params.end = new Date(endDate).toISOString();

  const { data } = await axiosInstance.get(`${API_BASE_COST}/total-cost-by-building`, { params });
  return data;
};