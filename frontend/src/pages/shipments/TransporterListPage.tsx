import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment } from '../../types/shipment';

const TransporterListPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shipmentService
      .listAssigned()
      .then((result) => setShipments(result.data.shipments))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Mes expéditions affectées</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="grid gap-3">
        {shipments.map((shipment) => (
          <Link
            key={shipment.id_shipment}
            to={`/shipments/${shipment.id_shipment}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <div className="font-semibold">{shipment.reference_shipment}</div>
            <div className="text-sm text-gray-600">{shipment.statut}</div>
            <div className="text-sm">{shipment.destination || shipment.shipping_address || '—'}</div>
          </Link>
        ))}
      </div>
      {shipments.length === 0 && !error && <p className="text-gray-500">Aucune expédition assignée.</p>}
    </div>
  );
};

export default TransporterListPage;
