import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { HistoryItem, Invoice } from '../../types/document';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    documentService
      .getInvoice(id)
      .then((result) => {
        setInvoice(result.data.invoice);
        setHistory(result.data.history);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;
  if (!invoice) return <div className="bg-white rounded-lg shadow p-6">Chargement...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Facture {invoice.numero_facture}</h1>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
        <div><dt className="text-gray-500">Commande</dt><dd>{invoice.id_order}</dd></div>
        <div><dt className="text-gray-500">Statut</dt><dd>{invoice.statut}</dd></div>
        <div><dt className="text-gray-500">HT</dt><dd>{invoice.montant_ht} {invoice.devise}</dd></div>
        <div><dt className="text-gray-500">Taxe</dt><dd>{invoice.montant_tva} {invoice.devise}</dd></div>
        <div><dt className="text-gray-500">TTC</dt><dd className="font-semibold">{invoice.montant_ttc} {invoice.devise}</dd></div>
        <div><dt className="text-gray-500">Date</dt><dd>{invoice.date_emission || '—'}</dd></div>
      </dl>
      <button
        className="bg-blue-700 text-white rounded px-4 py-2 mb-6"
        onClick={() => documentService.downloadInvoice(invoice.id_invoice).catch((err) => setError(err.message))}
      >
        Télécharger le PDF
      </button>
      <h2 className="font-semibold mb-2">Historique</h2>
      <ul className="text-sm space-y-2">
        {history.map((item) => (
          <li key={item.id_history}>
            {item.action} {item.new_status} — {new Date(item.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceDetailPage;
