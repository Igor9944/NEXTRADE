import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ImportExportService } from '../../services/importExportService';
import { documentService } from '../../services/documentService';
import { getSessionUser } from '../../auth/session';
import { ImportExportOperationWithDetails, ImportExportOperationStatus } from '../../types/importExport';
import { TradeDocument } from '../../types/document';
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
  Select,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { formatDate, formatStatus } from '../../lib/format';

const importExportService = new ImportExportService();

const transportLabels: Record<string, string> = {
  MARITIME: 'Maritime',
  AERIEN: 'Aérien',
  ROUTIER: 'Routier',
  FERROVIAIRE: 'Ferroviaire',
  AUTRE: 'Autre',
};

const ViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = getSessionUser();
  const [operation, setOperation] = useState<ImportExportOperationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<TradeDocument[]>([]);
  const [newStatus, setNewStatus] = useState<ImportExportOperationStatus | ''>('');
  const [updating, setUpdating] = useState(false);

  const fetchOperation = async (opId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await importExportService.getOperationById(opId);
      setOperation(result);
      try {
        const files = await documentService.listOperationDocuments(opId);
        setDocs(files.data.documents);
      } catch {
        setDocs([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOperation(id); }, [id]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  if (error || !operation) {
    return <EmptyState variant="error" title="Opération introuvable" description={error ?? ''} />;
  }

  const op = operation.operation;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Opération ${op.reference_operation}`}
        breadcrumbs={[{ label: 'Import/Export', href: '/import-export' }, { label: op.reference_operation }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Informations */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <Badge variant={statusToBadge(op.statut)}>{formatStatus(op.statut)}</Badge>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  { label: 'Type', value: op.type_operation },
                  { label: 'Transport', value: transportLabels[op.mode_transport] ?? op.mode_transport },
                  { label: 'Origine', value: op.pays_origine },
                  { label: 'Destination', value: op.pays_destination },
                  { label: 'Départ', value: formatDate(op.date_depart) },
                  { label: 'Arrivée prévue', value: formatDate(op.date_arrivee_prevue) },
                  { label: 'Arrivée réelle', value: formatDate(op.date_arrivee_reelle) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-nextrade-muted">{label}</dt>
                    <dd className="mt-0.5 font-medium">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader><CardTitle>Articles ({operation.items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable loading={false} empty={operation.items.length === 0} emptyTitle="Aucun article" cols={3}>
                <Table>
                  <TableHeader>
                    <TableHead>ID Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Unité</TableHead>
                  </TableHeader>
                  <TableBody>
                    {operation.items.map((item) => (
                      <TableRow key={item.id_item}>
                        <TableCell><span className="font-mono text-xs">{item.id_product}</span></TableCell>
                        <TableCell>{item.quantite}</TableCell>
                        <TableCell muted>{item.unite ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTable>
            </CardContent>
          </Card>
        </div>

        {/* Actions + Formalités + Documents */}
        <div className="space-y-4">
          {/* Mise à jour statut */}
          <Card>
            <CardHeader><CardTitle>Mettre à jour le statut</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    placeholder="Choisir un statut"
                    options={['PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE']
                      .map((v) => ({ value: v, label: formatStatus(v) }))}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ImportExportOperationStatus)}
                  />
                </div>
                <Button
                  variant="primary"
                  loading={updating}
                  disabled={!newStatus}
                  onClick={async () => {
                    if (!newStatus || !id) return;
                    setUpdating(true);
                    try {
                      await importExportService.updateOperationStatus(id, newStatus);
                      setOperation((prev) =>
                        prev ? { ...prev, operation: { ...prev.operation, statut: newStatus } } : null
                      );
                      setNewStatus('');
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : 'Erreur');
                    } finally {
                      setUpdating(false);
                    }
                  }}
                >
                  Appliquer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formalités douanières */}
          <Card>
            <CardHeader><CardTitle>Formalités ({operation.formalities.length})</CardTitle></CardHeader>
            <CardContent>
              {operation.formalities.length === 0 ? (
                <p className="text-sm text-nextrade-muted">Aucune formalité.</p>
              ) : (
                <ul className="space-y-2">
                  {operation.formalities.map((f) => (
                    <li key={f.id_formality} className="flex items-center justify-between gap-3">
                      <span className="text-sm">{formatStatus(f.type_formality)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusToBadge(f.statut)}>{formatStatus(f.statut)}</Badge>
                        {user?.role === 'ADMIN' && f.statut !== 'TERMINE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const next = f.statut === 'A_FAIRE' ? 'EN_COURS' : 'TERMINE';
                              try {
                                await documentService.updateFormality(f.id_formality, next);
                                if (id) fetchOperation(id);
                              } catch (err: unknown) {
                                setError(err instanceof Error ? err.message : 'Erreur');
                              }
                            }}
                          >
                            Avancer
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Documents liés */}
          <Card>
            <CardHeader><CardTitle>Documents ({docs.length})</CardTitle></CardHeader>
            <CardContent>
              {docs.length === 0 ? (
                <p className="text-sm text-nextrade-muted">Aucun document lié.</p>
              ) : (
                <ul className="space-y-1">
                  {docs.map((doc) => (
                    <li key={doc.id_document}>
                      <Link
                        to={`/documents/${doc.id_document}`}
                        className="text-sm text-nextrade-blue hover:underline"
                      >
                        {doc.reference_document} — {formatStatus(doc.type_document)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" as={Link} to="/import-export">
          ← Retour à la liste
        </Button>
      </div>
    </div>
  );
};

export default ViewPage;
