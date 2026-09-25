import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ImportExportService } from '../../services/importExportService';
import {
  ImportExportOperationWithDetails,
  ImportExportOperationType,
  ImportExportOperationStatus,
  TransportMode,
  CustomsFormalityStatus,
} from '../../types/importExport';

const importExportService = new ImportExportService();

const ViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [operation, setOperation] = useState<ImportExportOperationWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ImportExportOperationStatus | ''>('');

  useEffect(() => {
    if (id) {
      fetchOperation();
    }
  }, [id]);

  const fetchOperation = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await importExportService.getOperationById(id);
      setOperation(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the operation');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setLoading(true);
    try {
      await importExportService.updateOperationStatus(id, newStatus);
      setSuccess('Status updated successfully!');
      setOperation(prev => {
        if (!prev) return null;
        return { ...prev, operation: { ...prev.operation, statut: newStatus } };
      });
      setNewStatus('');
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!operation) {
    return <div className="p-6 text-center">Operation not found</div>;
  }

  const op = operation.operation;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Operation: {op.reference_operation}
      </h1>
      
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-500 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-500 rounded">{success}</div>}
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Basic Info */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Operation Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-lg font-medium">
                {op.type_operation === 'IMPORT' ? 'Import' : 'Export'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reference</p>
              <p className="text-lg font-medium break-all">{op.reference_operation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Linked Order</p>
              <p className="text-lg font-medium">{op.id_order || 'None'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Linked Purchase</p>
              <p className="text-lg font-medium">{op.id_purchase || 'None'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Origin Country</p>
              <p className="text-lg font-medium">{op.pays_origine}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Destination Country</p>
              <p className="text-lg font-medium">{op.pays_destination}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  op.statut === 'PREPARATION' ? 'bg-blue-100 text-blue-800' :
                  op.statut === 'EXPEDIEE' ? 'bg-green-100 text-green-800' :
                  op.statut === 'EN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                  op.statut === 'ARRIVEE' ? 'bg-indigo-100 text-indigo-800' :
                  op.statut === 'DOUANE' ? 'bg-purple-100 text-purple-800' :
                  op.statut === 'LIVREE' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {op.statut}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Transport Mode</p>
            <p className="text-lg font-medium">
              {op.mode_transport === 'MARITIME' ? 'Maritime' :
               op.mode_transport === 'AERIEN' ? 'Air' :
               op.mode_transport === 'ROUTIER' ? 'Road' :
               op.mode_transport === 'FERROVIAIRE' ? 'Rail' :
               op.mode_transport === 'AUTRE' ? 'Other' : '-'}
            </p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Date of Departure</p>
            <p className="text-lg font-medium">
              {op.date_depart ? new Date(op.date_depart).toLocaleDateString() : '-'}
            </p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Expected Arrival Date</p>
            <p className="text-lg font-medium">
              {op.date_arrivee_prevue ? new Date(op.date_arrivee_prevue).toLocaleDateString() : '-'}
            </p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Actual Arrival Date</p>
            <p className="text-lg font-medium">
              {op.date_arrivee_reelle ? new Date(op.date_arrivee_reelle).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
        
        {/* Status Update Section */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Update Status</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleStatusChange();
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ImportExportOperationStatus)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select a status</option>
                <option value="PREPARATION">Preparation</option>
                <option value="EXPEDIEE">Expedited</option>
                <option value="EN_TRANSIT">In Transit</option>
                <option value="ARRIVEE">Arrived</option>
                <option value="DOUANE">Customs</option>
                <option value="LIVREE">Delivered</option>
                <option value="ANNULEE">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !newStatus}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Items */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Items ({operation.items.length})</h2>
          {operation.items.length === 0 ? (
            <p className="text-gray-500">No items found for this operation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operation.items.map((item) => (
                    <tr key={item.id_item} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id_product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantite}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.unite || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Formalities */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Customs Formalities ({operation.formalities.length})</h2>
          {operation.formalities.length === 0 ? (
            <p className="text-gray-500">No formalities found for this operation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operation.formalities.map((formality) => (
                    <tr key={formality.id_formality} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formality.type_formality}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            formality.statut === 'A_FAIRE' ? 'bg-yellow-100 text-yellow-800' :
                            formality.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                            formality.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {formality.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(formality.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-2">
        <a
          href="/import-export"
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back to List
        </a>
      </div>
    </div>
  );
};

export default ViewPage;
