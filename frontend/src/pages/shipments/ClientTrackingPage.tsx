import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const ClientTrackingPage: React.FC = () => {
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
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Mes expéditions</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Référence</th>
              <th className="py-2 pr-3">Commande</th>
              <th className="py-2 pr-3">Statut</th>
              <th className="py-2 pr-3">Transporteur</th>
              <th className="py-2 pr-3">Suivi</th>
              <th className="py-2">Détail</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id_shipment} className="border-b">
                <td className="py-2 pr-3">{shipment.reference_shipment}</td>
                <td className="py-2 pr-3">{shipment.id_order.slice(0, 8)}…</td>
                <td className="py-2 pr-3">{shipment.statut}</td>
                <td className="py-2 pr-3">{shipment.carrier_name || '—'}</td>
                <td className="py-2 pr-3">{shipment.numero_suivi || '—'}</td>
                <td className="py-2">
                  <Link className="text-blue-700 underline" to={`/shipments/${shipment.id_shipment}`}>
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p className="text-gray-500">Chargement...</p>}
      {shipments.length === 0 && !error && !loading && <p className="mt-4 text-gray-500">Aucune expédition.</p>}
      <p className="mt-4 text-xs text-gray-400">Dates affichées selon le serveur : {formatDate(shipments[0]?.date_expedition)}</p>
    </div>
  );
};

export default ClientTrackingPage;
