import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PdfViewer = () => {
  const [estratti, setEstratti] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nomeFile, setNomeFile] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  const handlePdfUpload = async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);

    setNomeFile(file.name);
    setPdfPreviewUrl(URL.createObjectURL(file));
    setLoading(true);

    try {
      const res = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Errore HTTP:", res.status, errText);
        throw new Error("Errore durante l'estrazione dati");
      }

      const data = await res.json();
      setEstratti(data);
      toast.success("✅ Estrazione completata");
    } catch (err) {
      console.error("⚠️ Errore:", err);
      toast.error("❌ Errore durante il caricamento del PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvaSuMongo = async () => {
    if (!estratti || saving) return;
    setSaving(true);

    const file_pdf = nomeFile || "sconosciuto.pdf";
    const periodo = "sconosciuto";
    const sub_folder = "sconosciuto";

    const datiConEstensioni = {
      ...estratti,
      file_pdf,
      periodo,
      sub_folder,
    };

    try {
      const res = await fetch("/api/pdf/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datiConEstensioni),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Errore salvataggio:", data);
        throw new Error(data.error + ": " + (data.details || "Errore generico"));
      }

      toast.success("💾 Dati salvati su MongoDB!");
    } catch (err) {
      console.error("❌ Errore durante il salvataggio:", err);
      toast.error("Errore durante il salvataggio su MongoDB");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-white p-8">
      <ToastContainer />
      <h1 className="text-3xl mb-6">Carica Fattura Bolletta Idrica PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handlePdfUpload(file);
        }}
        className="mb-6"
      />

      {loading && <p className="text-yellow-400 text-lg">⏳ Estrazione in corso...</p>}

      {estratti && typeof estratti === "object" && (
        <div className="bg-gray-800 rounded p-6 mb-6 w-full">
          <h2 className="text-2xl font-semibold mb-4">📄 Dati Estratti</h2>

          <p className="mb-2"><strong>Totale Fattura:</strong> {estratti.totale || "N/A"}</p>
          <p className="mb-4"><strong>Indirizzo di Fornitura:</strong> {estratti.indirizzo || "N/A"}</p>

          {Array.isArray(estratti.letture) && estratti.letture.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-base border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    {Object.keys(estratti.letture[0]).map((col) => (
                      <th key={col} className="p-3 border-b border-gray-600 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estratti.letture.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-700">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-3 border-b border-gray-700">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="italic mt-2">Nessuna lettura rilevata nel PDF.</p>
          )}

          <div className="mt-4">
            <button
              onClick={handleSalvaSuMongo}
              disabled={saving}
              className={`bg-gray-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Salvataggio in corso..." : "💾 Salva su MongoDB"}
            </button>
          </div>

          <pre className="mt-6 text-xs bg-gray-900 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(estratti, null, 2)}
          </pre>
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="mt-10 w-full">
          <h2 className="text-2xl font-semibold mb-3">📑 Anteprima PDF</h2>
          <iframe
            src={pdfPreviewUrl}
            title="Anteprima PDF"
            className="w-full h-[90vh] rounded border border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default PdfViewer;

