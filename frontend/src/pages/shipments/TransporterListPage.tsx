import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';
import {
  PageHeader,
  Badge,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  statusToBadge,
} from '../../components/ui';
import { formatDate, formatStatus } from '../../lib/format';

const TransporterListPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shipmentService
      .listAssigned()
      .then((result) => setShipments(result.data.shipments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Mes expéditions affectées" />

      <DataTable
        loading={loading}
        error={error}
        empty={shipments.length === 0}
        emptyTitle="Aucune expédition"
        emptyDescription="Aucune tournée ne vous a encore été affectée."
        cols={4}
      >
        <Table>
          <TableHeader>
            <TableHead>Référence</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead />
          </TableHeader>
          <TableBody>
            {shipments.map((s) => (
              <TableRow key={s.id_shipment}>
                <TableCell>
                  <span className="font-mono text-xs">{s.reference_shipment}</span>
                </TableCell>
                <TableCell>{s.destination ?? s.shipping_address ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(s.statut)}>{formatStatus(s.statut)}</Badge>
                </TableCell>
                <TableCell muted>{formatDate(s.created_at)}</TableCell>
                <TableActions>
                  <Link
                    to={`/shipments/${s.id_shipment}`}
                    className="text-xs font-semibold text-nextrade-blue hover:underline"
                  >
                    Voir →
                  </Link>
                </TableActions>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default TransporterListPage;
