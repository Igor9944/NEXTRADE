import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { CustomsFormality, Invoice, TradeDocument } from '../../types/document';
import { getSessionUser } from '../../auth/session';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { formatStatus } from '../../lib/format';

const DossierPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const user = getSessionUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [factures, setFactures] = useState<TradeDocument[]>([]);
  const [packing, setPacking] = useState<TradeDocument[]>([]);
  const [autres, setAutres] = useState<TradeDocument[]>([]);
  const [formalities, setFormalities] = useState<CustomsFormality[]>([]);

  const load = () => {
    if (!orderId) return;
    setLoading(true);
    documentService
      .getOrderDossier(orderId)
      .then((result) => {
        setInvoice(result.data.invoice);
        setFactures(result.data.factures);
        setPacking(result.data.packing_lists);
        setAutres(result.data.autres);
        setFormalities(result.data.formalities);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [orderId]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  if (error) return <EmptyState variant="error" title="Erreur" description={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossier documentaire"
        description={`Commande ${orderId}`}
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Dossier' }]}
        actions={
          <div className="flex gap-2">
            {orderId && (user?.role === 'CLIENT' || user?.role === 'ADMIN') && (
              <Button variant="outline" as={Link} to={`/payments?orderId=${orderId}`} size="sm">
                Payer
              </Button>
            )}
            {user?.role === 'ADMIN' && orderId && !invoice && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  documentService
                    .generateInvoice(orderId)
                    .then(() => load())
                    .catch((err: unknown) =>
                      setError(err instanceof Error ? err.message : 'Erreur')
                    )
                }
              >
                Générer la facture
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Facture */}
        <Card>
          <CardHeader><CardTitle>Facture commerciale</CardTitle></CardHeader>
          <CardContent>
            {invoice ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{invoice.numero_facture}</p>
                  <p className="text-sm text-nextrade-muted">
                    {invoice.montant_ttc} {invoice.devise}
                  </p>
                </div>
                <Link
                  to={`/invoices/${invoice.id_invoice}`}
                  className="text-sm font-semibold text-nextrade-blue hover:underline"
                >
                  Voir →
                </Link>
              </div>
            ) : factures.length > 0 ? (
              <ul className="space-y-1">
                {factures.map((doc) => (
                  <li key={doc.id_document}>
                    <Link to={`/documents/${doc.id_document}`} className="text-sm text-nextrade-blue hover:underline">
                      {doc.reference_document}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nextrade-muted">Aucune facture.</p>
            )}
          </CardContent>
        </Card>

        {/* Packing List */}
        <Card>
          <CardHeader><CardTitle>Packing List</CardTitle></CardHeader>
          <CardContent>
            {packing.length > 0 ? (
              <ul className="space-y-1">
                {packing.map((doc) => (
                  <li key={doc.id_document}>
                    <Link to={`/documents/${doc.id_document}`} className="text-sm text-nextrade-blue hover:underline">
                      {doc.reference_document}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nextrade-muted">Aucune packing list.</p>
            )}
          </CardContent>
        </Card>

        {/* Autres documents */}
        <Card>
          <CardHeader><CardTitle>Autres documents</CardTitle></CardHeader>
          <CardContent>
            {autres.length > 0 ? (
              <ul className="space-y-1">
                {autres.map((doc) => (
                  <li key={doc.id_document}>
                    <Link to={`/documents/${doc.id_document}`} className="text-sm text-nextrade-blue hover:underline">
                      {doc.reference_document}{' '}
                      <span className="text-nextrade-muted">({formatStatus(doc.type_document)})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nextrade-muted">Aucun autre document.</p>
            )}
          </CardContent>
        </Card>

        {/* Formalités douanières */}
        <Card>
          <CardHeader><CardTitle>Formalités douanières</CardTitle></CardHeader>
          <CardContent>
            {formalities.length > 0 ? (
              <ul className="space-y-2">
                {formalities.map((item) => (
                  <li key={item.id_formality} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{formatStatus(item.type_formality)}</span>
                    <Badge variant={statusToBadge(item.statut)}>
                      {formatStatus(item.statut)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-nextrade-muted">Aucune formalité.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DossierPage;
