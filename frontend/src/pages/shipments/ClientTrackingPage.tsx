import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';
import { ShipmentTimeline } from '../../components/ShipmentTimeline';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
  statusToBadge,
} from '../../components/ui';
import { formatDate, formatStatus } from '../../lib/format';

const ClientTrackingPage: React.FC = () => {
  const { t } = useI18n();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shipmentService
      .listMine()
      .then((result) => {
        const rows = result?.data?.shipments ?? [];
        setShipments(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => setError(err.message ?? 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl3 bg-slate-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState variant="error" title="Erreur" description={error} />;
  }

  if (shipments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('myShipments')} />
        <EmptyState
          variant="empty"
          title="Aucune expédition"
          description="Vos expéditions apparaîtront ici une fois vos commandes expédiées."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('myShipments')} description={`${shipments.length} expédition(s)`} />

      <div className="grid gap-4">
        {shipments.map((s) => (
          <Card key={s.id_shipment}>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-nextrade-muted">
                  {s.reference_shipment}
                </span>
                <CardTitle>{s.destination ?? s.shipping_address ?? 'Destination inconnue'}</CardTitle>
              </div>
              <Badge variant={statusToBadge(s.statut)}>{formatStatus(s.statut)}</Badge>
            </CardHeader>
            <CardContent>
              <dl className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-nextrade-muted">Transporteur</dt>
                  <dd className="font-medium">{s.carrier_name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-nextrade-muted">Suivi</dt>
                  <dd className="font-mono text-xs">{s.numero_suivi ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-nextrade-muted">Livraison prévue</dt>
                  <dd className="font-medium">{formatDate(s.date_livraison_estimee)}</dd>
                </div>
              </dl>

              <div className="rounded-xl2 bg-nextrade-soft p-4">
                <ShipmentTimeline status={s.statut} />
              </div>

              <div className="mt-3 flex justify-end">
                <Link
                  to={`/shipments/${s.id_shipment}`}
                  className="text-sm font-semibold text-nextrade-blue hover:underline underline-offset-2"
                >
                  Voir le détail →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientTrackingPage;
