import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment, ShipmentHistoryItem } from '../../types/shipment';
import { ShipmentTimeline } from '../../components/ShipmentTimeline';
import { getSessionUser } from '../../auth/session';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Select,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { formatDateTime, formatDate, formatStatus } from '../../lib/format';

const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = getSessionUser();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistoryItem[]>([]);
  const [allowed, setAllowed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [transporteurId, setTransporteurId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!id) return;
    const result = await shipmentService.getById(id);
    setShipment(result.data.shipment);
    setHistory(result.data.history ?? []);
    setAllowed(result.data.allowed_next_statuses ?? []);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  }

  if (error || !shipment) {
    return (
      <EmptyState
        variant="error"
        title="Expédition introuvable"
        description={error ?? "Cette exp\u00e9dition n'existe pas ou vous n'y avez pas acc\u00e8s."}
      />
    );
  }

  const canMutate = user?.role === 'TRANSPORTEUR' || user?.role === 'ADMIN';
  const statusOptions = allowed
    .filter((s) => s !== 'LIVREE')
    .map((s) => ({ value: s, label: formatStatus(s) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Expédition ${shipment.reference_shipment}`}
        breadcrumbs={[
          { label: 'Expéditions', href: user?.role === 'ADMIN' ? '/shipments' : '/shipments/my' },
          { label: shipment.reference_shipment },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info + Timeline */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
              <Badge variant={statusToBadge(shipment.statut)}>{formatStatus(shipment.statut)}</Badge>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {[
                  { label: 'Transporteur', value: shipment.carrier_name ?? 'Non affecté' },
                  { label: 'Suivi', value: shipment.numero_suivi ?? '—' },
                  { label: 'Expédié le', value: formatDate(shipment.date_expedition) },
                  { label: 'Livraison prévue', value: formatDate(shipment.date_livraison_estimee) },
                  { label: 'Livré le', value: formatDate(shipment.date_livraison) },
                  { label: 'Destination', value: shipment.destination ?? shipment.shipping_address ?? '—' },
                  ...(shipment.recipient_name
                    ? [{ label: 'Destinataire', value: shipment.recipient_name }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-nextrade-muted">{label}</dt>
                    <dd className="mt-0.5 font-medium text-nextrade-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Avancement</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl2 bg-nextrade-soft p-4">
                <ShipmentTimeline status={shipment.statut} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique + Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                {history.map((item) => (
                  <li key={item.id_history} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-nextrade-blue" aria-hidden />
                    <div>
                      <p className="text-nextrade-ink">
                        <span className="text-nextrade-muted">{item.old_status ?? '—'}</span>
                        {' → '}
                        <span className="font-semibold">{formatStatus(item.new_status)}</span>
                      </p>
                      <p className="text-xs text-nextrade-muted">{formatDateTime(item.created_at)}</p>
                    </div>
                  </li>
                ))}
                {history.length === 0 && (
                  <p className="text-nextrade-muted">Aucun historique.</p>
                )}
              </ol>
            </CardContent>
          </Card>

          {/* Affecter transporteur (ADMIN) */}
          {user?.role === 'ADMIN' && (
            <Card>
              <CardHeader><CardTitle>Affecter un transporteur</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Input
                      placeholder="UUID transporteur"
                      value={transporteurId}
                      onChange={(e) => setTransporteurId(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    loading={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await shipmentService.assign(shipment.id_shipment, transporteurId);
                        await load();
                        setTransporteurId('');
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : 'Erreur');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Affecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mise à jour statut (transporteur + admin) */}
          {canMutate && shipment.statut !== 'LIVREE' && shipment.statut !== 'ANNULEE' && (
            <Card>
              <CardHeader><CardTitle>Mise à jour du statut</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Select
                      placeholder="Choisir un statut"
                      options={statusOptions}
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    loading={busy}
                    disabled={!nextStatus}
                    onClick={async () => {
                      if (!nextStatus) return;
                      setBusy(true);
                      try {
                        await shipmentService.updateStatus(shipment.id_shipment, nextStatus as never);
                        setNextStatus('');
                        await load();
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : 'Erreur');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Changer
                  </Button>
                </div>

                {/* Confirmation livraison */}
                {shipment.statut === 'EN_LIVRAISON' && (
                  <form
                    className="mt-4 space-y-3 rounded-xl2 bg-success-50 p-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBusy(true);
                      try {
                        await shipmentService.confirmDelivery(shipment.id_shipment, {
                          recipient_name: recipient,
                          delivery_notes: notes,
                        });
                        await load();
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : 'Erreur');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <p className="text-sm font-semibold text-success-700">Confirmer la livraison</p>
                    <Input
                      placeholder="Nom du destinataire"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                    />
                    <Textarea
                      placeholder="Notes de remise (optionnel)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <Button type="submit" variant="primary" loading={busy} className="w-full">
                      Enregistrer LIVREE
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailPage;
