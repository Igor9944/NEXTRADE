import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';

const AdminListPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState('');
  const [reference, setReference] = useState('');
  const [transporteurId, setTransporteurId] = useState('');

  const load = () => {
    shipmentService
      .list({
        statut: statut || undefined,
        reference_shipment: reference || undefined,
        transporteur_id: transporteurId || undefined
      })
      .then((result) => setShipments(result.data.shipments))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Expéditions</h1>
        <Link to="/shipments/create" className="bg-blue-700 text-white rounded px-4 py-2 text-center">
          Créer une expédition
        </Link>
      </div>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form
        className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
      >
        <input className="border rounded px-3 py-2" placeholder="Référence" value={reference} onChange={(e) => setReference(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="UUID transporteur" value={transporteurId} onChange={(e) => setTransporteurId(e.target.value)} />
        <select className="border rounded px-3 py-2" value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {['PREPARATION', 'PRISE_EN_CHARGE', 'EXPEDIEE', 'EN_TRANSIT', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button className="bg-gray-800 text-white rounded px-4 py-2" type="submit">Filtrer</button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Référence</th>
              <th className="py-2 pr-3">Commande</th>
              <th className="py-2 pr-3">Client</th>
              <th className="py-2 pr-3">Transporteur</th>
              <th className="py-2 pr-3">Statut</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id_shipment} className="border-b">
                <td className="py-2 pr-3">
                  <Link className="text-blue-700 underline" to={`/shipments/${shipment.id_shipment}`}>
                    {shipment.reference_shipment}
                  </Link>
                </td>
                <td className="py-2 pr-3">{shipment.id_order.slice(0, 8)}…</td>
                <td className="py-2 pr-3">{shipment.client_entreprise || `${shipment.client_prenom || ''} ${shipment.client_nom || ''}`.trim() || '—'}</td>
                <td className="py-2 pr-3">{shipment.carrier_name || '—'}</td>
                <td className="py-2 pr-3">{shipment.statut}</td>
                <td className="py-2">{new Date(shipment.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminListPage;
