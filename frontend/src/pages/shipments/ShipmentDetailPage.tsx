import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { Shipment, ShipmentHistoryItem } from '../../types/shipment';
import { ShipmentTimeline } from '../../components/ShipmentTimeline';
import { getSessionUser } from '../../auth/session';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = getSessionUser();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistoryItem[]>([]);
  const [allowed, setAllowed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [transporteurId, setTransporteurId] = useState('');

  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    const result = await shipmentService.getById(id);
    setShipment(result.data.shipment);
    setHistory(result.data.history ?? []);
    setAllowed(result.data.allowed_next_statuses ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [id]);

  if (error) {
    return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;
  }
  if (loading || !shipment) {
    return <div className="bg-white rounded-lg shadow p-6">Chargement...</div>;
  }

  const canMutate = user?.role === 'TRANSPORTEUR' || user?.role === 'ADMIN';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-xl font-bold mb-4">Expédition {shipment.reference_shipment}</h1>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Commande</dt><dd>{shipment.id_order}</dd></div>
          <div><dt className="text-gray-500">Statut</dt><dd className="font-semibold">{shipment.statut}</dd></div>
          <div><dt className="text-gray-500">Transporteur</dt><dd>{shipment.carrier_name || 'Non affecté'}</dd></div>
          <div><dt className="text-gray-500">Tracking</dt><dd>{shipment.numero_suivi || '—'}</dd></div>
          <div><dt className="text-gray-500">Expédition</dt><dd>{formatDate(shipment.date_expedition)}</dd></div>
          <div><dt className="text-gray-500">Date prévue</dt><dd>{formatDate(shipment.date_livraison_estimee)}</dd></div>
          <div><dt className="text-gray-500">Livraison</dt><dd>{formatDate(shipment.date_livraison)}</dd></div>
          <div><dt className="text-gray-500">Destination</dt><dd>{shipment.destination || shipment.shipping_address || '—'}</dd></div>
          {shipment.recipient_name && (
            <div><dt className="text-gray-500">Destinataire</dt><dd>{shipment.recipient_name}</dd></div>
          )}
        </dl>
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Avancement</h2>
          <ShipmentTimeline status={shipment.statut} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="font-semibold mb-3">Historique</h2>
          <ul className="space-y-2 text-sm">
            {history.map((item) => (
              <li key={item.id_history} className="border-b pb-2">
                {item.old_status || '—'} → {item.new_status}
                <div className="text-gray-500">{formatDate(item.created_at)}</div>
              </li>
            ))}
          </ul>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="font-semibold mb-3">Affecter un transporteur</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="border rounded px-3 py-2 flex-1"
                placeholder="UUID transporteur"
                value={transporteurId}
                onChange={(e) => setTransporteurId(e.target.value)}
              />
              <button
                className="bg-blue-700 text-white rounded px-4 py-2"
                onClick={async () => {
                  try {
                    await shipmentService.assign(shipment.id_shipment, transporteurId);
                    await load();
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
              >
                Affecter
              </button>
            </div>
          </div>
        )}

        {canMutate && shipment.statut !== 'LIVREE' && shipment.statut !== 'ANNULEE' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold">Mise à jour transporteur</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="border rounded px-3 py-2 flex-1"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                <option value="">Choisir un statut</option>
                {allowed.filter((status) => status !== 'LIVREE').map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                className="bg-blue-700 text-white rounded px-4 py-2"
                onClick={async () => {
                  if (!nextStatus) return;
                  try {
                    await shipmentService.updateStatus(shipment.id_shipment, nextStatus as any);
                    setNextStatus('');
                    await load();
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
              >
                Changer le statut
              </button>
            </div>

            {shipment.statut === 'EN_LIVRAISON' && (
              <form
                className="space-y-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await shipmentService.confirmDelivery(shipment.id_shipment, {
                      recipient_name: recipient,
                      delivery_notes: notes
                    });
                    await load();
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
              >
                <h3 className="font-medium">Confirmer la livraison</h3>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nom du destinataire"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="Notes de remise"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button className="bg-green-700 text-white rounded px-4 py-2" type="submit">
                  Enregistrer LIVREE
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetailPage;
