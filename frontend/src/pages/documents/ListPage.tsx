import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { TradeDocument } from '../../types/document';
import { getSessionUser } from '../../auth/session';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  Select,
  statusToBadge,
} from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { formatDate, formatStatus } from '../../lib/format';

const typeOptions = [
  { value: '', label: 'Tous les types' },
  ...['FACTURE_COMMERCIALE', 'PACKING_LIST', 'CERTIFICAT_ORIGINE', 'DOCUMENT_DOUANE', 'DOCUMENT_TRANSPORT', 'AUTRE']
    .map((v) => ({ value: v, label: formatStatus(v) })),
];

const DocumentsListPage: React.FC = () => {
  const { t } = useI18n();
  const user = getSessionUser();
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [type, setType] = useState('');
  const [invoiceOrderId, setInvoiceOrderId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadOrderId, setUploadOrderId] = useState('');
  const [uploadType, setUploadType] = useState('PACKING_LIST');

  const load = () => {
    setLoading(true);
    documentService
      .list({ id_order: orderId || undefined, type_document: type || undefined })
      .then((result) => setDocuments(result.data.documents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t('documentsTitle')} />

      {/* Filtres */}
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <Input
          placeholder={t('orderUuid')}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          aria-label="Filtrer par commande"
        />
        <Select
          options={typeOptions}
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full sm:w-56"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          {t('filter')}
        </Button>
      </form>

      {/* Actions admin */}
      {user?.role === 'ADMIN' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{t('generateInvoice')}</CardTitle></CardHeader>
            <CardContent>
              <form
                className="flex gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  try {
                    const result = await documentService.generateInvoice(invoiceOrderId);
                    window.location.href = `/invoices/${result.data.invoice.id_invoice}`;
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Erreur');
                  }
                }}
              >
                <Input
                  placeholder={t('orderUuid')}
                  value={invoiceOrderId}
                  onChange={(e) => setInvoiceOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary" className="shrink-0">
                  {t('createInvoicePdf')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Uploader un document</CardTitle></CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  form.append('type_document', uploadType);
                  form.append('id_order', uploadOrderId);
                  try {
                    await documentService.upload(form);
                    load();
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Erreur');
                  }
                }}
              >
                <Input
                  placeholder="UUID commande"
                  value={uploadOrderId}
                  onChange={(e) => setUploadOrderId(e.target.value)}
                />
                <Select
                  options={[
                    { value: 'PACKING_LIST', label: 'Packing List' },
                    { value: 'DOCUMENT_DOUANE', label: 'Document douane' },
                    { value: 'AUTRE', label: 'Autre' },
                  ]}
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                />
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-nextrade-muted"
                />
                <Button type="submit" variant="outline">Uploader</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-500">{error}</p>
      )}

      {/* Tableau */}
      <DataTable
        loading={loading}
        error={!error ? null : error}
        empty={documents.length === 0}
        emptyTitle="Aucun document"
        emptyDescription="Aucun document disponible avec ces filtres."
        cols={5}
      >
        <Table>
          <TableHeader>
            <TableHead>Référence</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fichier</TableHead>
            <TableHead>Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead />
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id_document}>
                <TableCell>
                  <Link
                    to={`/documents/${doc.id_document}`}
                    className="font-mono text-xs font-semibold text-nextrade-blue hover:underline"
                  >
                    {doc.reference_document}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{formatStatus(doc.type_document)}</Badge>
                </TableCell>
                <TableCell muted>{doc.original_file_name ?? doc.nom_fichier}</TableCell>
                <TableCell>
                  {doc.id_order ? (
                    <Link
                      to={`/documents/dossier/${doc.id_order}`}
                      className="text-xs text-nextrade-blue hover:underline"
                    >
                      Dossier →
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell muted>{formatDate(doc.created_at)}</TableCell>
                <TableActions>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      documentService
                        .download(doc.id_document)
                        .catch((err: unknown) =>
                          setError(err instanceof Error ? err.message : 'Erreur')
                        )
                    }
                  >
                    ↓
                  </Button>
                </TableActions>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default DocumentsListPage;
