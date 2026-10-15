import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { PageHeader, Card, CardContent, Button } from '../../components/ui';
import { Input } from '../../components/ui/Input';

const AdminCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [idOrder, setIdOrder] = useState('');
  const [transporteurId, setTransporteurId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [tracking, setTracking] = useState('');
  const [eta, setEta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer une expédition"
        breadcrumbs={[
          { label: 'Expéditions', href: '/shipments' },
          { label: 'Créer' },
        ]}
      />

      <Card className="max-w-xl">
        <CardContent>
          {error && (
            <p role="alert" className="mb-4 text-sm text-danger-500">
              {error}
            </p>
          )}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                const result = await shipmentService.create({
                  id_order: idOrder,
                  transporteur_id: transporteurId || undefined,
                  origin: origin || undefined,
                  destination: destination || undefined,
                  numero_suivi: tracking || undefined,
                  date_livraison_estimee: eta ? new Date(eta).toISOString() : undefined,
                });
                navigate(`/shipments/${result.data.id_shipment}`);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Erreur');
              } finally {
                setLoading(false);
              }
            }}
          >
            <Input
              label="UUID commande"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={idOrder}
              onChange={(e) => setIdOrder(e.target.value)}
              required
            />
            <Input
              label="UUID transporteur (optionnel)"
              placeholder="xxxxxxxx-…"
              value={transporteurId}
              onChange={(e) => setTransporteurId(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Origine"
                placeholder="Paris, France"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
              <Input
                label="Destination"
                placeholder="Lomé, Togo"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <Input
              label="Numéro de suivi"
              placeholder="TRK000000"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <Input
              label="Date de livraison prévue"
              type="datetime-local"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Créer l'expédition
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreatePage;
