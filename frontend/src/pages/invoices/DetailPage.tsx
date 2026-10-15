import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { HistoryItem, Invoice } from '../../types/document';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { IconDownload } from '../../components/icons';
import { formatPrice, formatDate, formatStatus } from '../../lib/format';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    documentService
      .getInvoice(id)
      .then((result) => {
        setInvoice(result.data.invoice);
        setHistory(result.data.history);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  if (error || !invoice) {
    return <EmptyState variant="error" title="Facture introuvable" description={error ?? ''} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Facture ${invoice.numero_facture}`}
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: invoice.numero_facture }]}
        actions={
          <Button
            variant="primary"
            iconLeft={<IconDownload className="h-4 w-4" />}
            onClick={() =>
              documentService
                .downloadInvoice(invoice.id_invoice)
                .catch((err: unknown) =>
                  setError(err instanceof Error ? err.message : 'Erreur')
                )
            }
          >
            Télécharger PDF
          </Button>
        }
      />

      {/* Résumé facture */}
      <Card>
        <CardContent className="pt-5">
          {/* En-tête */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <img
                src="/assets/nextrade/nextrade-logo.png"
                alt="NexTrade"
                className="mb-3 h-12 w-auto object-contain"
              />
              <p className="text-sm text-nextrade-muted">Solution Export Import</p>
            </div>
            <div className="text-start sm:text-end">
              <p className="text-2xl font-black text-nextrade-ink">
                {invoice.numero_facture}
              </p>
              <p className="mt-1 text-sm text-nextrade-muted">
                Émise le {formatDate(invoice.date_emission)}
              </p>
              <div className="mt-2">
                <Badge variant={statusToBadge(invoice.statut)}>
                  {formatStatus(invoice.statut)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Montants */}
          <div className="rounded-xl2 border border-nextrade-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: 'Montant HT', value: formatPrice(invoice.montant_ht, invoice.devise) },
                  { label: 'Taxe (TVA)', value: formatPrice(invoice.montant_tva, invoice.devise) },
                ].map(({ label, value }) => (
                  <tr key={label} className="border-b border-nextrade-border">
                    <td className="px-4 py-3 text-nextrade-muted">{label}</td>
                    <td className="px-4 py-3 text-end font-medium text-nextrade-ink">{value}</td>
                  </tr>
                ))}
                <tr className="bg-nextrade-soft">
                  <td className="px-4 py-4 font-bold text-nextrade-ink">Total TTC</td>
                  <td className="px-4 py-4 text-end text-xl font-black text-nextrade-blue">
                    {formatPrice(invoice.montant_ttc, invoice.devise)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historique */}
      {history.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="mb-3 font-semibold text-nextrade-ink">Historique</h2>
            <ol className="space-y-2 text-sm">
              {history.map((item) => (
                <li key={item.id_history} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-nextrade-blue" aria-hidden />
                  <div>
                    <span className="text-nextrade-ink">
                      {item.action} {item.new_status ?? ''}
                    </span>
                    <span className="ms-2 text-xs text-nextrade-muted">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
