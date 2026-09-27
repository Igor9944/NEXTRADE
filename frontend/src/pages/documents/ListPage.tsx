import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { TradeDocument } from '../../types/document';
import { getSessionUser } from '../../auth/session';

const DocumentsListPage: React.FC = () => {
  const user = getSessionUser();
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [type, setType] = useState('');
  const [invoiceOrderId, setInvoiceOrderId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadOrderId, setUploadOrderId] = useState('');
  const [uploadType, setUploadType] = useState('PACKING_LIST');

  const load = () => {
    documentService
      .list({ id_order: orderId || undefined, type_document: type || undefined })
      .then((result) => setDocuments(result.data.documents))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Dossier documentaire</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form
        className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
      >
        <input className="border rounded px-3 py-2" placeholder="UUID commande" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          {['FACTURE_COMMERCIALE', 'PACKING_LIST', 'CERTIFICAT_ORIGINE', 'DOCUMENT_DOUANE', 'DOCUMENT_TRANSPORT', 'AUTRE'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button className="bg-gray-800 text-white rounded px-4 py-2" type="submit">Filtrer</button>
      </form>

      {user?.role === 'ADMIN' && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <form
            className="border rounded p-3 space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              try {
                const result = await documentService.generateInvoice(invoiceOrderId);
                window.location.href = `/invoices/${result.data.invoice.id_invoice}`;
              } catch (err: any) {
                setError(err.message);
              }
            }}
          >
            <h2 className="font-semibold">Générer une facture</h2>
            <input className="border rounded px-3 py-2 w-full" placeholder="UUID commande" value={invoiceOrderId} onChange={(e) => setInvoiceOrderId(e.target.value)} />
            <button className="bg-blue-700 text-white rounded px-4 py-2" type="submit">Créer la facture PDF</button>
          </form>
          <form
            className="border rounded p-3 space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              if (!file) return;
              const form = new FormData();
              form.append('file', file);
              form.append('type_document', uploadType);
              form.append('id_order', uploadOrderId);
              try {
                await documentService.upload(form);
                load();
              } catch (err: any) {
                setError(err.message);
              }
            }}
          >
            <h2 className="font-semibold">Uploader un document</h2>
            <input className="border rounded px-3 py-2 w-full" placeholder="UUID commande" value={uploadOrderId} onChange={(e) => setUploadOrderId(e.target.value)} />
            <select className="border rounded px-3 py-2 w-full" value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
              <option value="PACKING_LIST">PACKING_LIST</option>
              <option value="AUTRE">AUTRE</option>
              <option value="DOCUMENT_DOUANE">DOCUMENT_DOUANE</option>
            </select>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="bg-blue-700 text-white rounded px-4 py-2" type="submit">Uploader</button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Référence</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Fichier</th>
              <th className="py-2 pr-3">Commande</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id_document} className="border-b">
                <td className="py-2 pr-3">
                  <Link className="text-blue-700 underline" to={`/documents/${document.id_document}`}>
                    {document.reference_document}
                  </Link>
                </td>
                <td className="py-2 pr-3">{document.type_document}</td>
                <td className="py-2 pr-3">{document.original_file_name || document.nom_fichier}</td>
                <td className="py-2 pr-3">{document.id_order ? (
                  <Link className="text-blue-700 underline" to={`/documents/dossier/${document.id_order}`}>Dossier</Link>
                ) : '—'}</td>
                <td className="py-2">{new Date(document.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsListPage;
