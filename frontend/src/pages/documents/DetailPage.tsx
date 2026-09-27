import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { HistoryItem, TradeDocument } from '../../types/document';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<TradeDocument | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    documentService
      .getById(id)
      .then((result) => {
        setDocument(result.data.document);
        setHistory(result.data.history);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;
  if (!document) return <div className="bg-white rounded-lg shadow p-6">Chargement...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">{document.reference_document}</h1>
      <p className="mb-2">{document.type_document}</p>
      <p className="mb-4 text-sm text-gray-600">{document.original_file_name || document.nom_fichier}</p>
      <button
        className="bg-blue-700 text-white rounded px-4 py-2 mb-6"
        onClick={() => documentService.download(document.id_document).catch((err) => setError(err.message))}
      >
        Télécharger
      </button>
      <h2 className="font-semibold mb-2">Historique</h2>
      <ul className="text-sm space-y-2">
        {history.map((item) => (
          <li key={item.id_history} className="border-b pb-2">
            {item.action} {item.old_status || '—'} → {item.new_status || '—'}
            <div className="text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentDetailPage;
