import React, { useState, useEffect } from 'react';
import { ImportExportService } from '../../services/importExportService';
import {
  ImportExportOperationRecord,
  ImportExportOperationType,
  ImportExportOperationStatus,
} from '../../types/importExport';

const importExportService = new ImportExportService();

const ListPage: React.FC = () => {
  const [operations, setOperations] = useState<ImportExportOperationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type_operation: '' as ImportExportOperationType | '',
    statut: '' as ImportExportOperationStatus | '',
    reference_operation: '',
    pays_origine: '',
    pays_destination: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOperations();
  }, [filters]);

  const fetchOperations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Remove empty filters
      const filteredKeys = Object.keys(filters).filter(
        (key) => filters[key as keyof typeof filters] !== '' && filters[key as keyof typeof filters] !== null
      );
      
      const filterObj: any = {};
      filteredKeys.forEach((key) => {
        filterObj[key] = filters[key];
      });

      const result = await importExportService.listOperations(filterObj);
      setOperations(result.operations);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching operations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (op: ImportExportOperationRecord) => {
    // For simplicity, we'll just cycle through statuses for demo
    // In a real app, you'd have a dropdown with allowed transitions
    const statusOrder: ImportExportOperationStatus[] = [
      'PREPARATION',
      'EXPEDIEE',
      'EN_TRANSIT',
      'ARRIVEE',
      'DOUANE',
      'LIVREE',
    ];
    const currentIndex = statusOrder.indexOf(op.statut as ImportExportOperationStatus);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    importExportService.updateOperationStatus(op.id_operation, newStatus).then(() => {
      fetchOperations();
    }).catch((err) => {
      alert('Failed to update status: ' + err.message);
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import-Export Operations</h1>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={filters.type_operation}
            onChange={(e) => setFilters({ ...filters, type_operation: e.target.value as ImportExportOperationType })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="IMPORT">Import</option>
            <option value="EXPORT">Export</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value as ImportExportOperationStatus })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="PREPARATION">Preparation</option>
            <option value="EXPEDIEE">Expedited</option>
            <option value="EN_TRANSIT">In Transit</option>
            <option value="ARRIVEE">Arrived</option>
            <option value="DOUANE">Customs</option>
            <option value="LIVREE">Delivered</option>
            <option value="ANNULEE">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reference</label>
          <input
            value={filters.reference_operation}
            onChange={(e) => setFilters({ ...filters, reference_operation: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Search reference..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Origin Country</label>
          <input
            value={filters.pays_origine}
            onChange={(e) => setFilters({ ...filters, pays_origine: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Origin country..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Destination Country</label>
          <input
            value={filters.pays_destination}
            onChange={(e) => setFilters({ ...filters, pays_destination: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Destination country..."
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({
              ...filters,
              page: 1, // Reset to first page when filtering
            })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Create New Button */}
      <div className="mb-4">
        <a 
          href="/import-export/create" 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Operation
        </a>
      </div>
      
      {/* Operations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Departure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Arrival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500" colSpan="8">
                  No operations found
                </td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.id_operation} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {op.reference_operation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.type_operation === 'IMPORT' ? 'Import' : 'Export'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.pays_origine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.pays_destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {op.date_depart ? new Date(op.date_depart).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {op.date_arrivee_prevue ? new Date(op.date_arrivee_prevue).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(op)}
                        className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Change Status
                      </button>
                      <a
                        href={`/import-export/view/${op.id_operation}`}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {operations.length} of {pagination.total} operations
        </div>
        <div>
          <button
            onClick={() => {
              if (filters.page > 1) {
                setFilters({ ...filters, page: filters.page - 1 });
              }
            }}
            disabled={filters.page === 1}
            className="px-3 py-1 ml-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {filters.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => {
              if (filters.page < pagination.totalPages) {
                setFilters({ ...filters, page: filters.page + 1 });
              }
            }}
            disabled={filters.page === pagination.totalPages}
            className="px-3 py-1 ml-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
