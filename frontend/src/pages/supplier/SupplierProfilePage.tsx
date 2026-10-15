import React, { useEffect, useState } from 'react';
import { getSupplierProfile } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
} from '../../components/ui';

type SupplierProfile = {
  id_supplier_profile: string;
  nom: string | null;
  description: string | null;
  identifiant_professionnel: string | null;
  email_professionnel: string | null;
  telephone: string | null;
  statut_verification: string;
  date_verification: string | null;
};

function verificationVariant(v: string): 'success' | 'warning' | 'danger' {
  if (v === 'VERIFIE') return 'success';
  if (v === 'REJETE') return 'danger';
  return 'warning';
}

const SupplierProfilePage: React.FC = () => {
  const { t } = useI18n();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSupplierProfile()
      .then((result) => { if (active) setProfile(result as SupplierProfile); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : t('error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  if (error) return <EmptyState variant="error" title={t('error')} description={error} />;
  if (!profile) return <EmptyState variant="empty" title={t('supplierProfileMissing')} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierProfile')}
        description={t('supplierWorkspace')}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('supplierProfile')}</CardTitle>
          <Badge variant={verificationVariant(profile.statut_verification)}>
            {t(`verification${profile.statut_verification}`)}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-nextrade-muted">{t('supplierCompany')}</dt>
              <dd className="mt-1 font-medium">
                {profile.nom ?? profile.identifiant_professionnel ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-nextrade-muted">{t('supplierContact')}</dt>
              <dd className="mt-1 break-all font-medium">
                {profile.email_professionnel ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-nextrade-muted">{t('supplierTelephone')}</dt>
              <dd className="mt-1 font-medium">{profile.telephone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-nextrade-muted">{t('supplierProfileStatus')}</dt>
              <dd className="mt-1">
                <Badge variant={verificationVariant(profile.statut_verification)}>
                  {t(`verification${profile.statut_verification}`)}
                </Badge>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-nextrade-muted">{t('supplierDescription')}</dt>
              <dd className="mt-1 whitespace-pre-line text-nextrade-muted">
                {profile.description ?? t('supplierDescriptionEmpty')}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-nextrade-muted">{t('supplierProfileReadOnly')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierProfilePage;
