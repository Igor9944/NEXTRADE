import React, { useEffect, useState } from 'react';
import { getSupplierDocuments } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Badge,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  statusToBadge,
} from '../../components/ui';
import { formatDate, formatStatus } from '../../lib/format';

const SupplierDocumentsPage: React.FC = () => {
  const { t } = useI18n();
  const [documents, setDocuments] = useState<Awaited<ReturnType<typeof getSupplierDocuments>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSupplierDocuments()
      .then((result) => { if (active) setDocuments(result); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : t('error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierDocuments')}
        description={t('supplierWorkspace')}
      />

      <DataTable
        loading={loading}
        error={error}
        empty={documents.length === 0}
        emptyTitle={t('supplierNoDocuments')}
        cols={4}
      >
        <Table>
          <TableHeader>
            <TableHead>{t('reference')}</TableHead>
            <TableHead>{t('supplierDocumentType')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id_document}>
                <TableCell>
                  <span className="font-mono text-xs">{doc.reference_document}</span>
                </TableCell>
                <TableCell>{formatStatus(doc.type_document)}</TableCell>
                <TableCell>
                  <Badge variant={statusToBadge(doc.statut)}>
                    {formatStatus(doc.statut)}
                  </Badge>
                </TableCell>
                <TableCell muted>{formatDate(doc.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default SupplierDocumentsPage;
