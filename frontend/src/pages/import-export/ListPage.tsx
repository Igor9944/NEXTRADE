import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImportExportService } from '../../services/importExportService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  ImportExportOperationRecord,
  ImportExportOperationType,
  ImportExportOperationStatus,
} from '../../types/importExport';

const importExportService = new ImportExportService();

const ListPage: React.FC = () => {
  const { t } = useI18n();
  const [operations, setOperations] = useState<ImportExportOperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  useEffect(() => {
    const fetchOperations = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterObj: Record<string, string | number> = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null) filterObj[key] = value;
        });
        const result = await importExportService.listOperations(filterObj as never);
        setOperations(result.operations || []);
        setPagination({
          total: result.total || 0,
          page: result.page || 1,
          limit: result.limit || 10,
          totalPages: result.totalPages || 0,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('error'));
        setOperations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOperations();
  }, [filters, t]);

  const handleStatusChange = (op: ImportExportOperationRecord) => {
    const statusOrder: ImportExportOperationStatus[] = [
      'PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE',
    ];
    const currentIndex = statusOrder.indexOf(op.statut as ImportExportOperationStatus);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    importExportService.updateOperationStatus(op.id_operation, newStatus).then(() => {
      setFilters({ ...filters });
    }).catch((err) => {
      setError(err.message);
    });
  };

  if (loading) return <div className="bg-white rounded-lg shadow p-6">{t('loading')}</div>;
  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">{t('navImportExport')}</h1>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          {t('ieType')}
          <select
            value={filters.type_operation}
            onChange={(e) => setFilters({ ...filters, type_operation: e.target.value as ImportExportOperationType, page: 1 })}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">{t('ieAllTypes')}</option>
            <option value="IMPORT">IMPORT</option>
            <option value="EXPORT">EXPORT</option>
          </select>
        </label>
        <label className="text-sm">
          {t('ieStatus')}
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value as ImportExportOperationStatus, page: 1 })}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            <option value="">{t('ieAllStatuses')}</option>
            {['PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE'].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t('ieReference')}
          <input
            value={filters.reference_operation}
            onChange={(e) => setFilters({ ...filters, reference_operation: e.target.value, page: 1 })}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>
        <label className="text-sm">
          {t('ieOrigin')}
          <input
            value={filters.pays_origine}
            onChange={(e) => setFilters({ ...filters, pays_origine: e.target.value, page: 1 })}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>
      </div>
      <div className="mb-4">
        <Link to="/import-export/create" className="inline-block bg-green-600 text-white px-4 py-2 rounded">
          {t('ieCreate')}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-start">{t('ieReference')}</th>
              <th className="px-4 py-3 text-start">{t('ieType')}</th>
              <th className="px-4 py-3 text-start">{t('ieOrigin')}</th>
              <th className="px-4 py-3 text-start">{t('ieDestination')}</th>
              <th className="px-4 py-3 text-start">{t('ieStatus')}</th>
              <th className="px-4 py-3 text-start">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {operations.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={6}>{t('ieEmpty')}</td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.id_operation} className="border-t">
                  <td className="px-4 py-3">{op.reference_operation}</td>
                  <td className="px-4 py-3">{op.type_operation}</td>
                  <td className="px-4 py-3">{op.pays_origine}</td>
                  <td className="px-4 py-3">{op.pays_destination}</td>
                  <td className="px-4 py-3">{op.statut}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleStatusChange(op)} className="px-3 py-1 text-xs bg-gray-200 rounded">
                        {t('ieChangeStatus')}
                      </button>
                      <Link to={`/import-export/view/${op.id_operation}`} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {t('details')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <div>{operations.length} / {pagination.total}</div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {t('previous')}
          </button>
          <span>{filters.page} / {pagination.totalPages || 1}</span>
          <button
            type="button"
            disabled={filters.page >= (pagination.totalPages || 1)}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
