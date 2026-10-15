import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImportExportService } from '../../services/importExportService';
import {
  ImportExportOperationType,
  ImportExportOperationStatus,
  TransportMode,
} from '../../types/importExport';
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Select,
} from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { IconAlert, IconCheck } from '../../components/icons';

const importExportService = new ImportExportService();

const CreatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    type_operation: 'IMPORT' as ImportExportOperationType,
    id_order: '',
    id_purchase: '',
    reference_operation: '',
    pays_origine: '',
    pays_destination: '',
    statut: 'PREPARATION' as ImportExportOperationStatus,
    date_depart: '',
    date_arrivee_prevue: '',
    mode_transport: 'MARITIME' as TransportMode,
    items: [{ id_product: '', quantite: 1, unite: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleItemChange = (index: number, field: string, value: unknown) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id_product: '', quantite: 1, unite: '' }],
    }));

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await importExportService.createOperation({
        type_operation: formData.type_operation,
        id_order: formData.id_order || undefined,
        id_purchase: formData.id_purchase || undefined,
        reference_operation: formData.reference_operation,
        pays_origine: formData.pays_origine,
        pays_destination: formData.pays_destination,
        statut: formData.statut,
        date_depart: formData.date_depart || null,
        date_arrivee_prevue: formData.date_arrivee_prevue || null,
        mode_transport: formData.mode_transport,
        items: formData.items.map((item) => ({
          id_product: item.id_product,
          quantite: item.quantite,
          unite: item.unite || undefined,
        })),
      });
      setSuccess(true);
      setFormData({
        type_operation: 'IMPORT',
        id_order: '',
        id_purchase: '',
        reference_operation: '',
        pays_origine: '',
        pays_destination: '',
        statut: 'PREPARATION',
        date_depart: '',
        date_arrivee_prevue: '',
        mode_transport: 'MARITIME',
        items: [{ id_product: '', quantite: 1, unite: '' }],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Créer une opération ${formData.type_operation === 'IMPORT' ? "d'Import" : "d'Export"}`}
        breadcrumbs={[
          { label: 'Import/Export', href: '/import-export' },
          { label: 'Créer' },
        ]}
      />

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden />
          <p className="text-sm text-danger-700">{error}</p>
        </div>
      )}

      {success && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-success-100 bg-success-50 px-4 py-3">
          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-500" aria-hidden />
          <p className="text-sm text-success-700">Opération créée avec succès !</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Type d'opération"
                options={[{ value: 'IMPORT', label: 'Import' }, { value: 'EXPORT', label: 'Export' }]}
                value={formData.type_operation}
                onChange={(e) => handleChange('type_operation', e.target.value)}
              />
              <Input
                label="ID commande (optionnel)"
                placeholder="UUID commande"
                value={formData.id_order}
                onChange={(e) => handleChange('id_order', e.target.value)}
                description="Laisser vide si lié à un achat"
              />
              <Input
                label="ID achat (optionnel)"
                placeholder="UUID achat"
                value={formData.id_purchase}
                onChange={(e) => handleChange('id_purchase', e.target.value)}
              />
            </div>
            <Input
              label="Référence opération"
              placeholder="IMP-2026-000001"
              value={formData.reference_operation}
              onChange={(e) => handleChange('reference_operation', e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Pays d'origine"
                placeholder="Chine"
                value={formData.pays_origine}
                onChange={(e) => handleChange('pays_origine', e.target.value)}
                required
              />
              <Input
                label="Pays de destination"
                placeholder="Togo"
                value={formData.pays_destination}
                onChange={(e) => handleChange('pays_destination', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Date de départ"
                type="date"
                value={formData.date_depart}
                onChange={(e) => handleChange('date_depart', e.target.value)}
              />
              <Input
                label="Date d'arrivée prévue"
                type="date"
                value={formData.date_arrivee_prevue}
                onChange={(e) => handleChange('date_arrivee_prevue', e.target.value)}
              />
              <Select
                label="Mode de transport"
                options={[
                  { value: 'MARITIME', label: 'Maritime' },
                  { value: 'AERIEN', label: 'Aérien' },
                  { value: 'ROUTIER', label: 'Routier' },
                  { value: 'FERROVIAIRE', label: 'Ferroviaire' },
                  { value: 'AUTRE', label: 'Autre' },
                ]}
                value={formData.mode_transport}
                onChange={(e) => handleChange('mode_transport', e.target.value as TransportMode)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-nextrade-ink">Articles ({formData.items.length})</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + Ajouter
              </Button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="rounded-xl2 border border-nextrade-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-nextrade-muted">Article {index + 1}</p>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      Retirer
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="ID Produit"
                    placeholder="UUID produit"
                    value={item.id_product}
                    onChange={(e) => handleItemChange(index, 'id_product', e.target.value)}
                    required
                  />
                  <Input
                    label="Quantité"
                    type="number"
                    min="1"
                    value={item.quantite}
                    onChange={(e) => handleItemChange(index, 'quantite', parseInt(e.target.value) || 1)}
                    required
                  />
                  <Input
                    label="Unité (optionnel)"
                    placeholder="kg, unités…"
                    value={item.unite}
                    onChange={(e) => handleItemChange(index, 'unite', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" as={Link} to="/import-export">
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Créer l'opération
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePage;
