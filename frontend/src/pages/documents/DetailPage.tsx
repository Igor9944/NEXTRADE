import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { HistoryItem, TradeDocument } from '../../types/document';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
} from '../../components/ui';
import { IconDownload } from '../../components/icons';
import { formatDateTime, formatStatus } from '../../lib/format';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<TradeDocument | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    documentService
      .getById(id)
      .then((result) => {
        setDoc(result.data.document);
        setHistory(result.data.history);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;

  if (error || !doc) {
    return (
      <EmptyState variant="error" title="Document introuvable" description={error ?? ''} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={doc.reference_document}
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: doc.reference_document }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <Badge variant="neutral">{formatStatus(doc.type_document)}</Badge>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-nextrade-muted">Fichier</dt>
                <dd className="font-medium">{doc.original_file_name ?? doc.nom_fichier}</dd>
              </div>
              {doc.id_order && (
                <div>
                  <dt className="text-xs text-nextrade-muted">Commande liée</dt>
                  <dd className="font-mono text-xs">{doc.id_order.slice(0, 8)}…</dd>
                </div>
              )}
            </dl>
            <Button
              variant="primary"
              size="md"
              className="mt-5"
              iconLeft={<IconDownload className="h-4 w-4" />}
              onClick={() =>
                documentService
                  .download(doc.id_document)
                  .catch((err: unknown) =>
                    setError(err instanceof Error ? err.message : 'Erreur')
                  )
              }
            >
              Télécharger
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:w-80">
          <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {history.map((item) => (
                <li key={item.id_history} className="flex items-start gap-2">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-nextrade-blue" aria-hidden />
                  <div>
                    <p className="text-nextrade-ink">
                      {item.action} {item.old_status ? `${item.old_status} →` : ''}{' '}
                      {item.new_status ?? '—'}
                    </p>
                    <p className="text-xs text-nextrade-muted">{formatDateTime(item.created_at)}</p>
                  </div>
                </li>
              ))}
              {history.length === 0 && <p className="text-nextrade-muted">Aucun historique.</p>}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
