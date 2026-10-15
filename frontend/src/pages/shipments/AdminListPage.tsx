import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';
import {
  PageHeader,
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
  Input,
  Select,
  statusToBadge,
} from '../../components/ui';
import { formatDate, formatStatus } from '../../lib/format';

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  ...['PREPARATION', 'PRISE_EN_CHARGE', 'EXPEDIEE', 'EN_TRANSIT', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE'].map((v) => ({
    value: v,
    label: formatStatus(v),
  })),
];

const AdminListPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState('');
  const [reference, setReference] = useState('');

  const load = () => {
    setLoading(true);
    shipmentService
      .list({
        statut: statut || undefined,
        reference_shipment: reference || undefined,
      })
      .then((result) => setShipments(result.data.shipments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expéditions"
        actions={
          <Button as={Link} variant="primary" to="/shipments/create">
            Créer une expédition
          </Button>
        }
      />

      {/* Filtres */}
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); load(); }}
      >
        <Input
          placeholder="Référence…"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          aria-label="Filtrer par référence"
        />
        <Select
          options={statusOptions}
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full sm:w-52"
          aria-label="Filtrer par statut"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Filtrer
        </Button>
      </form>

      <DataTable
        loading={loading}
        error={error}
        empty={shipments.length === 0}
        emptyTitle="Aucune expédition"
        cols={6}
      >
        <Table>
          <TableHeader>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Transporteur</TableHead>
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
                <TableCell muted>
                  {(s.client_entreprise ?? `${s.client_prenom ?? ''} ${s.client_nom ?? ''}`.trim()) || '—'}
                </TableCell>
                <TableCell muted>{s.carrier_name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(s.statut)}>{formatStatus(s.statut)}</Badge>
                </TableCell>
                <TableCell muted>{formatDate(s.created_at)}</TableCell>
                <TableActions>
                  <Link
                    to={`/shipments/${s.id_shipment}`}
                    className="text-xs font-semibold text-nextrade-blue hover:underline"
                  >
                    Détail →
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

export default AdminListPage;
