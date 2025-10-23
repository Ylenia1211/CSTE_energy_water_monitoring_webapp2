/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `NotificationTable`, che visualizza una tabella di logs con la possibilità di
 * navigare tra le pagine dei dati. Ogni notifica contiene informazioni come la data, il tipo, il messaggio, l'edificio e il sensore.
 * Il componente supporta la paginazione, permettendo all'utente di navigare tra le pagine dei dati.
 *
 * @module NotificationTable
 */

import React from "react";

/**
 * Componente per visualizzare una tabella di logs/anomalie con paginazione.
 * La tabella mostra informazioni relative a ciascuna notifica, tra cui la data, il tipo, il messaggio, l'edificio e il sensore.
 * Include anche la funzionalità di paginazione per navigare tra le diverse pagine di notifiche.
 *
 * @component
 * @example
 * return (
 *   <NotificationTable
 *     notifications={notifications}
 *     currentPage={1}
 *     totalPages={5}
 *     onPageChange={handlePageChange}
 *   />
 * );
 *
 * @param {Array} notifications - Lista delle notifiche da visualizzare.
 * @param {number} currentPage - La pagina attuale della paginazione.
 * @param {number} totalPages - Il numero totale di pagine di notifiche.
 * @param {function} onPageChange - Funzione di callback per gestire il cambiamento di pagina.
 *
 * @returns {JSX.Element} La tabella con i logs e la navigazione tra le pagine.
 */

const NotificationTable = ({
  notifications,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="overflow-x-auto rounded">
      <table className="min-w-full border border-gray-300 bg-white rounded">
        <thead className="bg-100">
          <tr>
            <th className="px-4 py-2 border-b text-left font-semibold">Data</th>
            <th className="px-4 py-2 border-b text-left font-semibold">Tipo</th>
            <th className="px-4 py-2 border-b text-left font-semibold">
              Messaggio
            </th>
            <th className="px-4 py-2 border-b text-left font-semibold">
              Edificio
            </th>
            <th className="px-4 py-2 border-b text-left font-semibold">
              Sensore
            </th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">
                {new Date(notif.timestamp)
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " ")}
              </td>
              <td className="px-4 py-2 border-b">{notif.type}</td>
              <td className="px-4 py-2 border-b">{notif.message}</td>
              <td className="px-4 py-2 border-b">{notif.building}</td>
              <td className="px-4 py-2 border-b">{notif.sensor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <button
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded disabled:bg-gray-600"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Successivo
        </button>
        <span className="text-white">
          Pagina {currentPage} di {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-400 text-white rounded disabled:bg-gray-600"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Precedente
        </button>
      </div>
    </div>
  );
};

export default NotificationTable;
