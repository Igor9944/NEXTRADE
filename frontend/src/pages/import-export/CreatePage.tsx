import React, { useState } from 'react';
import { ImportExportService } from '../../services/importExportService';
import {
  ImportExportOperationType,
  ImportExportOperationStatus,
  TransportMode,
} from '../../types/importExport';

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
    items: [
      {
        id_product: '',
        quantite: 1,
        unite: '',
      }
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (itemIndex: string, field: string, value: any) => {
    setFormData({
      ...formData,
      items: formData.items.map((item, index) =>
        index === parseInt(itemIndex)
          ? { ...item, [field]: value }
          : item
      ),
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id_product: '',
          quantite: 1,
          unite: '',
        },
      ],
    });
  };

  const removeItem = (itemIndex: number) => {
    if (formData.items.length <= 1) {
      alert('At least one item is required');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((_, index) => index !== itemIndex),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.reference_operation.trim()) {
        throw new Error('Reference operation is required');
      }
      if (!formData.pays_origine.trim() || !formData.pays_destination.trim()) {
        throw new Error('Origin and destination countries are required');
      }
      if (!formData.id_order && !formData.id_purchase) {
        throw new Error('Either order ID or purchase ID must be provided');
      }
      if (formData.items.some(item => !item.id_product.trim())) {
        throw new Error('Product ID is required for all items');
      }
      if (formData.items.some(item => item.quantite <= 0)) {
        throw new Error('Quantity must be greater than zero for all items');
      }

      const result = await importExportService.createOperation({
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
        items: formData.items.map(item => ({
          id_product: item.id_product,
          quantite: item.quantite,
          unite: item.unite || undefined,
        })),
      });

      setSuccess('Operation created successfully!');
      // Reset form after success
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
        items: [
          {
            id_product: '',
            quantite: 1,
            unite: '',
          }
        ],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the operation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {formData.type_operation === 'IMPORT' ? 'Create Import Operation' : 'Create Export Operation'}
      </h1>
      
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-500 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-500 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Operation Type</label>
            <select
              value={formData.type_operation}
              onChange={(e) => handleChange('type_operation', e.target.value as ImportExportOperationType)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="IMPORT">Import</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
            <input
              value={formData.id_order}
              onChange={(e) => handleChange('id_order', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter order ID"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty if linking to a purchase</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase ID (optional)</label>
            <input
              value={formData.id_purchase}
              onChange={(e) => handleChange('id_purchase', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter purchase ID"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty if linking to an order</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reference Operation</label>
            <input
              value={formData.reference_operation}
              onChange={(e) => handleChange('reference_operation', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., IMP-2026-000001"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Origin Country</label>
              <input
                value={formData.pays_origine}
                onChange={(e) => handleChange('pays_origine', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., China"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination Country</label>
              <input
                value={formData.pays_destination}
                onChange={(e) => handleChange('pays_destination', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Togo"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Departure</label>
              <input
                type="date"
                value={formData.date_depart}
                onChange={(e) => handleChange('date_depart', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Arrival Date</label>
              <input
                type="date"
                value={formData.date_arrivee_prevue}
                onChange={(e) => handleChange('date_arrivee_prevue', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transport Mode</label>
              <select
                value={formData.mode_transport}
                onChange={(e) => handleChange('mode_transport', e.target.value as TransportMode)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="MARITIME">Maritime</option>
                <option value="AERIEN">Air</option>
                <option value="ROUTIER">Road</option>
                <option value="FERROVIAIRE">Rail</option>
                <option value="AUTRE">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-2">Items</h2>
          <div className="border rounded p-4">
            {formData.items.map((item, index) => (
              <div key={index} className="mb-4 pb-4 border-b last:mb-0 last:border-b-0">
                <h3 className="text-lg font-medium mb-2">Item {index + 1}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product ID</label>
                    <input
                      value={item.id_product}
                      onChange={(e) => handleItemChange(index.toString(), 'id_product', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter product ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantite}
                      onChange={(e) => handleItemChange(index.toString(), 'quantite', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit (optional)</label>
                    <input
                      value={item.unite}
                      onChange={(e) => handleItemChange(index.toString(), 'unite', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., kg, units, liters"
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => removeItem(index)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={formData.items.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <button
                onClick={addItem}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Operation'}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/import-export'}
            className="ml-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePage;
