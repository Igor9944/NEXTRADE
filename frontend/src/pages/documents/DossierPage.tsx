import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { CustomsFormality, Invoice, TradeDocument } from '../../types/document';
import { getSessionUser } from '../../auth/session';

const DossierPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const user = getSessionUser();
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [factures, setFactures] = useState<TradeDocument[]>([]);
  const [packing, setPacking] = useState<TradeDocument[]>([]);
  const [autres, setAutres] = useState<TradeDocument[]>([]);
  const [formalities, setFormalities] = useState<CustomsFormality[]>([]);

  const load = () => {
    if (!orderId) return;
    documentService
      .getOrderDossier(orderId)
      .then((result) => {
        setInvoice(result.data.invoice);
        setFactures(result.data.factures);
        setPacking(result.data.packing_lists);
        setAutres(result.data.autres);
        setFormalities(result.data.formalities);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, [orderId]);

  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-xl font-bold mb-2">Dossier documentaire</h1>
        <p className="text-sm text-gray-600 break-all">Commande {orderId}</p>
        {orderId && (user?.role === 'CLIENT' || user?.role === 'ADMIN') && (
          <Link className="inline-block mt-3 text-blue-700 underline mr-4" to={`/payments?orderId=${orderId}`}>
            Payer cette commande
          </Link>
        )}
        {user?.role === 'ADMIN' && orderId && !invoice && (
          <button
            className="mt-3 bg-blue-700 text-white rounded px-4 py-2"
            onClick={() =>
              documentService
                .generateInvoice(orderId)
                .then(() => load())
                .catch((err) => setError(err.message))
            }
          >
            Générer la facture
          </button>
        )}
      </div>

      <section className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="font-semibold mb-2">Facture commerciale</h2>
        {invoice && (
          <p className="text-sm mb-2">
            {invoice.numero_facture} — {invoice.montant_ttc} {invoice.devise}{' '}
            <Link className="text-blue-700 underline" to={`/invoices/${invoice.id_invoice}`}>Voir</Link>
          </p>
        )}
        {factures.map((doc) => (
          <div key={doc.id_document} className="text-sm">
            <Link className="text-blue-700 underline" to={`/documents/${doc.id_document}`}>{doc.reference_document}</Link>
          </div>
        ))}
        {!invoice && factures.length === 0 && <p className="text-gray-500 text-sm">Aucune facture.</p>}
      </section>

      <section className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="font-semibold mb-2">Packing List</h2>
        {packing.length === 0 && <p className="text-gray-500 text-sm">Aucune packing list.</p>}
        {packing.map((doc) => (
          <div key={doc.id_document} className="text-sm">
            <Link className="text-blue-700 underline" to={`/documents/${doc.id_document}`}>{doc.reference_document}</Link>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="font-semibold mb-2">Autres documents</h2>
        {autres.length === 0 && <p className="text-gray-500 text-sm">Aucun autre document.</p>}
        {autres.map((doc) => (
          <div key={doc.id_document} className="text-sm">
            <Link className="text-blue-700 underline" to={`/documents/${doc.id_document}`}>{doc.reference_document} ({doc.type_document})</Link>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="font-semibold mb-2">Formalités douanières</h2>
        {formalities.length === 0 && <p className="text-gray-500 text-sm">Aucune formalité.</p>}
        <ul className="text-sm space-y-1">
          {formalities.map((item) => (
            <li key={item.id_formality}>{item.type_formality} — {item.statut}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DossierPage;
