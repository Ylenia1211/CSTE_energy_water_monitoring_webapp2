/**
 * @namespace pages
 * @fileoverview
 * Il file `Logs.jsx` contiene il componente che gestisce la visualizzazione e la gestione dei log delle anomalie.
 * Il componente esegue il recupero dei log tramite una chiamata API e li visualizza in una tabella,
 * con funzionalità di paginazione. Inoltre, include un filtro per cercare log specifici e un'opzione
 * per esportare i dati in formato Excel. La gestione del caricamento e degli errori viene effettuata
 * per garantire una buona esperienza utente.
 *
 * Quando il componente viene caricato, vengono recuperati i log e mostrati in una tabella.
 * Inoltre, è possibile applicare filtri, cambiare pagina e esportare i dati.
 * Se si verifica un errore durante il recupero dei log o durante l'esportazione, viene mostrato un messaggio
 * di errore all'utente.
 *
 * @module Logs
 */

import React, { useState, useEffect } from "react";
import LogFilter from "../components/common/LogFilter";
import NotificationTable from "../components/dashboard/NotificationTable";
import { getLogs } from "../utils/logsAPI";
import { exportToExcel, exportQueryDataToExcel } from "../utils/exportAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Componente `Logs` che visualizza e gestisce i log delle anomalie.
 * Recupera i log tramite un'API, applica i filtri, gestisce la paginazione e
 * consente l'esportazione dei dati in formato Excel. Gestisce anche lo stato di caricamento e gli errori.
 *
 * @component
 * @example
 * return (
 *   <Logs />
 * )
 */
const Logs = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  /**
   * Funzione per ottenere i log dalla API
   * @async
   * @function
   * @param {number} page - La pagina da recuperare.
   * @param {Object} filterParams - I parametri dei filtri applicati.
   * @returns {Promise<void>} - Una promessa che non restituisce nulla.
   */
  useEffect(() => {
    const fetchLogs = async (page = currentPage, filterParams = filters) => {
      setLoading(true);
      try {
        const data = await getLogs({ ...filterParams, page, limit: 10 });
        setNotifications(data.logs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel recupero dei log:", error.message);
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, filters]);

  /**
   * Funzione per cambiare la pagina nella paginazione.
   * @param {number} page - Numero della pagina da visualizzare.
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Funzione per aggiornare i filtri applicati.
   * Quando i filtri vengono modificati, la pagina viene resetta alla prima pagina.
   * @param {Object} newFilters - I nuovi filtri da applicare.
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Configurazione delle colonne da esportare in formato Excel
   * @constant {Array<Object>}
   * @default
   */
  const columnsConfig = [
    { header: "Data", key: "timestamp", width: 20 },
    { header: "Tipo", key: "type", width: 10 },
    { header: "Messaggio", key: "message", width: 50 },
    { header: "Edificio", key: "building", width: 20 },
    { header: "Sensore", key: "sensor", width: 15 },
  ];

  /**
   * Funzione per esportare i log in formato Excel.
   * Utilizza la funzione `exportQueryDataToExcel` per esportare i dati filtrati.
   * Viene mostrato un messaggio di successo o errore a seconda dell'esito dell'operazione.
   * @async
   * @function
   */
  const handleExportToExcel = async () => {
    try {
      // Ottieni tutti i dati senza paginazione per l'esportazione
      await exportQueryDataToExcel(
        "Logs_Anomalie",
        "anomalyService",
        "getAllFilteredLogs",
        { filters },
        columnsConfig
      );
      toast.success("Esportato con successo.");
    } catch (error) {
      console.error("Errore durante l'esportazione:", error.message);
      toast.error("Errore durante l'esportazione.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-white mb-4">
        Logs delle Anomalie
      </h1>

      <ToastContainer />
      <LogFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center">Caricamento...</div>
      ) : (
        <>
          {" "}
          <button
            className="mt-4 px-4 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded"
            onClick={handleExportToExcel}
          >
            Esporta in Excel
          </button>
          <NotificationTable
            notifications={notifications}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Logs;
