import React, { useEffect, useState } from "react";

const PdfRecordsTable = () => {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [indirizzoFilter, setIndirizzoFilter] = useState("");
  const [contatoreFilter, setContatoreFilter] = useState("");
  const [annoFilter, setAnnoFilter] = useState("");
  const [meseFilter, setMeseFilter] = useState("");
  const [trimestreFilter, setTrimestreFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("/api/pdf/all");
        const data = await res.json();
        setRecords(data);
        setFiltered(data);
      } catch (err) {
        console.error("Errore nel fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    let filteredData = records;

    if (indirizzoFilter) {
      filteredData = filteredData.filter((r) => r.indirizzo === indirizzoFilter);
    }
    if (contatoreFilter) {
      filteredData = filteredData.filter((r) => r.contatore === contatoreFilter);
    }
    if (annoFilter) {
      filteredData = filteredData.filter(
        (r) => r.data && new Date(r.data).getFullYear().toString() === annoFilter
      );
    }
    if (meseFilter) {
      filteredData = filteredData.filter(
        (r) => r.data && (new Date(r.data).getMonth() + 1).toString() === meseFilter
      );
    }
    if (trimestreFilter) {
      filteredData = filteredData.filter((r) => {
        if (!r.data) return false;
        const m = new Date(r.data).getMonth() + 1;
        const trimestre = Math.ceil(m / 3);
        return `Q${trimestre}` === trimestreFilter;
      });
    }

    setFiltered(filteredData);
    setCurrentPage(1); // Reset pagina quando i filtri cambiano
  }, [
    indirizzoFilter,
    contatoreFilter,
    annoFilter,
    meseFilter,
    trimestreFilter,
    records,
  ]);

  const uniqueValues = (key) =>
    [...new Set(records.map((r) => r[key]).filter(Boolean))];

  const uniqueYears = () =>
    [...new Set(records.map((r) => r.data && new Date(r.data).getFullYear()))]
      .filter(Boolean)
      .sort((a, b) => b - a);

  const paginatedData = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const handleExportCSV = () => {
    const rows = [
      [
        "Indirizzo",
        "Totale",
        "Data",
        "Contatore",
        "Lettura",
        "Consumo",
        "Tipo Lettura",
        "File",
      ],
      ...filtered.map((r) => [
        r.indirizzo,
        r.totale,
        r.data ? new Date(r.data).toLocaleDateString("it-IT") : "",
        r.contatore,
        r.lettura,
        r.consumo,
        r["tipo lettura"] || r.tipo_lettura,
        r.file_pdf,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((row) => row.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "estratti_pdf.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-900 text-white">
      <h2 className="text-3xl mb-6">Documenti Estratti  - Archivio Bollette Idriche</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm">Indirizzo</label>
          <select
            value={indirizzoFilter}
            onChange={(e) => setIndirizzoFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="">Tutti</option>
            {uniqueValues("indirizzo").map((val, i) => (
              <option key={i} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Contatore</label>
          <select
            value={contatoreFilter}
            onChange={(e) => setContatoreFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="">Tutti</option>
            {uniqueValues("contatore").map((val, i) => (
              <option key={i} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Anno</label>
          <select
            value={annoFilter}
            onChange={(e) => setAnnoFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="">Tutti</option>
            {uniqueYears().map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Mese</label>
          <select
            value={meseFilter}
            onChange={(e) => setMeseFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="">Tutti</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{(i + 1).toString().padStart(2, "0")}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Trimestre</label>
          <select
            value={trimestreFilter}
            onChange={(e) => setTrimestreFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value="">Tutti</option>
            <option value="Q1">Q1 (Gen-Mar)</option>
            <option value="Q2">Q2 (Apr-Giu)</option>
            <option value="Q3">Q3 (Lug-Set)</option>
            <option value="Q4">Q4 (Ott-Dic)</option>
          </select>
        </div>

        <div className="ml-auto mt-6 sm:mt-auto">
          <button
            onClick={handleExportCSV}
            className="bg-indigo-900 hover:bg-indigo-400 text-white py-2 px-4 rounded"
          >
             Esporta CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-yellow-400">⏳ Caricamento...</p>
      ) : paginatedData.length === 0 ? (
        <p className="text-red-400">Nessun documento trovato.</p>
      ) : (
        <>
          <div className="overflow-auto rounded border border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="p-2">Indirizzo</th>
                  <th className="p-2">Totale</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Contatore</th>
                  <th className="p-2">Lettura</th>
                  <th className="p-2">Consumo</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">File</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, i) => (
                  <tr key={i} className="odd:bg-gray-800 even:bg-gray-700">
                    <td className="p-2">{item.indirizzo}</td>
                    <td className="p-2">{item.totale}</td>
                    <td className="p-2">{new Date(item.data).toLocaleDateString("it-IT")}</td>
                    <td className="p-2">{item.contatore}</td>
                    <td className="p-2">{item.lettura}</td>
                    <td className="p-2">{item.consumo}</td>
                    <td className="p-2">{item["tipo lettura"] || item.tipo_lettura}</td>
                    <td className="p-2">{item.file_pdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginazione */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded ${
                  num === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
    
  );
    
};

export default PdfRecordsTable;