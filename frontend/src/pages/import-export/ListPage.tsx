import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImportExportService } from '../../services/importExportService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  ImportExportOperationRecord,
  ImportExportOperationType,
  ImportExportOperationStatus,
} from '../../types/importExport';
import {
  PageHeader,
  Badge,
  Button,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  Select,
  statusToBadge,
} from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { formatDate, formatStatus } from '../../lib/format';

const importExportService = new ImportExportService();

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  ...['PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE']
    .map((v) => ({ value: v, label: formatStatus(v) })),
];

const ListPage: React.FC = () => {
  const { t } = useI18n();
  const [operations, setOperations] = useState<ImportExportOperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type_operation: '' as ImportExportOperationType | '',
    statut: '' as ImportExportOperationStatus | '',
    reference_operation: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterObj: Record<string, string | number> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null) filterObj[k] = v;
      });
      const result = await importExportService.listOperations(filterObj as never);
      setOperations(result.operations ?? []);
      setPagination({
        total: result.total ?? 0,
        page: result.page ?? 1,
        totalPages: result.totalPages ?? 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'));
      setOperations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters.page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('navImportExport')}
        actions={
          <Button variant="primary" as={Link} to="/import-export/create">
            {t('ieCreate')}
          </Button>
        }
      />

      {/* Filtres */}
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); setFilters((f) => ({ ...f, page: 1 })); load(); }}
      >
        <Input
          placeholder={t('ieReference')}
          value={filters.reference_operation}
          onChange={(e) => setFilters((f) => ({ ...f, reference_operation: e.target.value }))}
          aria-label="Filtrer par référence"
        />
        <Select
          options={[{ value: '', label: t('ieAllTypes') }, { value: 'IMPORT', label: 'Import' }, { value: 'EXPORT', label: 'Export' }]}
          value={filters.type_operation}
          onChange={(e) => setFilters((f) => ({ ...f, type_operation: e.target.value as ImportExportOperationType | '' }))}
          className="w-full sm:w-40"
        />
        <Select
          options={statusOptions}
          value={filters.statut}
          onChange={(e) => setFilters((f) => ({ ...f, statut: e.target.value as ImportExportOperationStatus | '' }))}
          className="w-full sm:w-52"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          {t('filter')}
        </Button>
      </form>

      <DataTable
        loading={loading}
        error={error}
        empty={operations.length === 0}
        emptyTitle={t('ieEmpty')}
        cols={6}
      >
        <Table>
          <TableHeader>
            <TableHead>{t('ieReference')}</TableHead>
            <TableHead>{t('ieType')}</TableHead>
            <TableHead>{t('ieOrigin')}</TableHead>
            <TableHead>{t('ieDestination')}</TableHead>
            <TableHead>{t('ieStatus')}</TableHead>
            <TableHead />
          </TableHeader>
          <TableBody>
            {operations.map((op) => (
              <TableRow key={op.id_operation}>
                <TableCell>
                  <span className="font-mono text-xs">{op.reference_operation}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={op.type_operation === 'IMPORT' ? 'info' : 'processing'}>
                    {op.type_operation}
                  </Badge>
                </TableCell>
                <TableCell muted>{op.pays_origine}</TableCell>
                <TableCell muted>{op.pays_destination}</TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(op.statut)}>{formatStatus(op.statut)}</Badge>
                </TableCell>
                <TableActions>
                  <Link
                    to={`/import-export/view/${op.id_operation}`}
                    className="text-xs font-semibold text-nextrade-blue hover:underline"
                  >
                    {t('details')} →
                  </Link>
                </TableActions>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-nextrade-muted">
            {operations.length} / {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              {t('previous')}
            </Button>
            <span className="flex items-center text-nextrade-muted">
              {filters.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage;
