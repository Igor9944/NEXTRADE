import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupplierDashboard, SupplierDashboard } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  CardStat,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  EmptyState,
  SkeletonKPI,
  statusToBadge,
} from '../../components/ui';
import { IconDocument, IconNotification, IconVerification } from '../../components/icons';
import { formatDate, formatStatus } from '../../lib/format';

function verificationVariant(v: string): 'success' | 'warning' | 'danger' {
  if (v === 'VERIFIE') return 'success';
  if (v === 'REJETE') return 'danger';
  return 'warning';
}

const SupplierDashboardPage: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<SupplierDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSupplierDashboard()
      .then((result) => { if (active) setData(result); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : t('error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <SkeletonKPI key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('error')}
        description={error ?? ''}
      />
    );
  }

  const verification = data.profile?.statut_verification ?? 'NON_VERIFIE';

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierDashboard')}
        description={t('supplierWorkspace')}
        actions={
          <Button variant="outline" as={Link} to="/supplier/profile" size="sm">
            {t('supplierEditProfile')}
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CardStat
          label={t('supplierDocuments')}
          value={data.counts.documents}
          icon={<IconDocument className="h-5 w-5" />}
        />
        <CardStat
          label={t('supplierProfileStatus')}
          value={
            <Badge variant={verificationVariant(verification)}>
              {t(`verification${verification}`)}
            </Badge>
          }
          icon={<IconVerification className="h-5 w-5" />}
        />
        <CardStat
          label={t('supplierNotifications')}
          value={data.counts.notifications}
          icon={<IconNotification className="h-5 w-5" />}
        />
      </div>

      {/* Profil + accès rapides */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('supplierProfile')}</CardTitle>
            <Badge variant={verificationVariant(verification)}>
              {t(`verification${verification}`)}
            </Badge>
          </CardHeader>
          <CardContent>
            {data.profile ? (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-nextrade-muted">{t('supplierCompany')}</dt>
                  <dd className="mt-1 font-medium">
                    {data.profile.identifiant_professionnel ?? data.profile.email_professionnel ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-nextrade-muted">{t('supplierContact')}</dt>
                  <dd className="mt-1 break-all font-medium">
                    {data.profile.email_professionnel ?? '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-nextrade-muted">{t('supplierDescription')}</dt>
                  <dd className="mt-1 whitespace-pre-line text-nextrade-muted">
                    {data.profile.description ?? t('supplierDescriptionEmpty')}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-nextrade-muted">{t('supplierProfileMissing')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('supplierNextSteps')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/supplier/documents', label: t('supplierDocuments') },
                { to: '/supplier/profile', label: t('supplierProfile') },
                { to: '/supplier/notifications', label: t('supplierNotifications') },
                { to: '/supplier/orders', label: t('supplierNavOrders') },
              ].map((link) => (
                <li key={link.to} className="flex items-center justify-between gap-3">
                  <span className="text-nextrade-muted">{link.label}</span>
                  <Link
                    to={link.to}
                    className="text-xs font-semibold text-nextrade-blue hover:underline"
                  >
                    {t('view')} →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Documents récents */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-nextrade-ink">
          {t('supplierRecentDocuments')}
        </h2>
        <DataTable
          loading={false}
          empty={data.documents.length === 0}
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
              {data.documents.slice(0, 5).map((doc) => (
                <TableRow key={doc.id_document}>
                  <TableCell>
                    <span className="font-mono text-xs">{doc.reference_document}</span>
                  </TableCell>
                  <TableCell>{formatStatus(doc.type_document)}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadge(doc.statut)}>{formatStatus(doc.statut)}</Badge>
                  </TableCell>
                  <TableCell muted>{formatDate(doc.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </div>
    </div>
  );
};

export default SupplierDashboardPage;
