import React, { useEffect, useState } from 'react';
import { getSupplierProfile } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';

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

const SupplierProfilePage: React.FC = () => {
  const { t } = useI18n();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSupplierProfile().then((result) => active && setProfile(result as SupplierProfile)).catch((caught) => active && setError(caught instanceof Error ? caught.message : t('error'))).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;
  if (error) return <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</section>;
  if (!profile) return <section className="rounded-xl border bg-white p-5">{t('supplierProfileMissing')}</section>;

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-blue-700">{t('supplierWorkspace')}</p><h1 className="mt-1 text-2xl font-bold">{t('supplierProfile')}</h1></div>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">{t('supplierCompany')}</dt><dd className="mt-1 font-medium">{profile.nom || profile.identifiant_professionnel || '—'}</dd></div>
          <div><dt className="text-sm text-slate-500">{t('supplierContact')}</dt><dd className="mt-1 break-all font-medium">{profile.email_professionnel || '—'}</dd></div>
          <div><dt className="text-sm text-slate-500">{t('supplierTelephone')}</dt><dd className="mt-1 font-medium">{profile.telephone || '—'}</dd></div>
          <div><dt className="text-sm text-slate-500">{t('supplierProfileStatus')}</dt><dd className="mt-1 font-medium">{t(`verification${profile.statut_verification}`)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-slate-500">{t('supplierDescription')}</dt><dd className="mt-1 whitespace-pre-line">{profile.description || t('supplierDescriptionEmpty')}</dd></div>
        </dl>
      </section>
      <p className="text-sm text-slate-500">{t('supplierProfileReadOnly')}</p>
    </div>
  );
};

export default SupplierProfilePage;
