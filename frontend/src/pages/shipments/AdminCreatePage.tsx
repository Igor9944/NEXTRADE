import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';

const AdminCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [idOrder, setIdOrder] = useState('');
  const [transporteurId, setTransporteurId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [tracking, setTracking] = useState('');
  const [eta, setEta] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Créer une expédition</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const result = await shipmentService.create({
              id_order: idOrder,
              transporteur_id: transporteurId || undefined,
              origin: origin || undefined,
              destination: destination || undefined,
              numero_suivi: tracking || undefined,
              date_livraison_estimee: eta ? new Date(eta).toISOString() : undefined
            });
            navigate(`/shipments/${result.data.id_shipment}`);
          } catch (err: any) {
            setError(err.message);
          }
        }}
      >
        <input className="w-full border rounded px-3 py-2" placeholder="UUID commande" value={idOrder} onChange={(e) => setIdOrder(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="UUID transporteur (optionnel)" value={transporteurId} onChange={(e) => setTransporteurId(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Origine" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Numéro de suivi" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        <label className="block text-sm text-gray-600">
          Date prévue
          <input className="mt-1 w-full border rounded px-3 py-2" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} />
        </label>
        <button className="bg-blue-700 text-white rounded px-4 py-2" type="submit">Créer</button>
      </form>
    </div>
  );
};

export default AdminCreatePage;
