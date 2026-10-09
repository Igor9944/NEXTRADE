import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupplierDashboard, SupplierDashboard } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
};

const statusLabel = (status: string): string => status.replaceAll('_', ' ');

const SupplierDashboardPage: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<SupplierDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSupplierDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : t('error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  if (loading) return <section aria-live="polite" className="grid gap-4"><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-40 animate-pulse rounded-xl bg-slate-100" /></section>;

  if (error) return <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"><h1 className="font-semibold">{t('error')}</h1><p className="mt-2">{error}</p></section>;

  if (!data) return <section className="rounded-xl border bg-white p-5">{t('noData')}</section>;

  const verification = data.profile?.statut_verification ?? 'NON_VERIFIE';
  const verificationTone = verification === 'VERIFIE' ? 'bg-emerald-50 text-emerald-700' : verification === 'REJETE' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-blue-700">{t('supplierWorkspace')}</p><h1 className="mt-1 text-2xl font-bold">{t('supplierDashboard')}</h1></div>
        <Link to="/supplier/profile" className="rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-800">{t('supplierEditProfile')}</Link>
      </section>

      <section aria-label={t('supplierSummary')} className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{t('supplierDocuments')}</p><p className="mt-2 text-3xl font-bold">{data.counts.documents}</p></article>
        <article className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{t('supplierProfileStatus')}</p><p className="mt-2 text-sm font-semibold">{t(`verification${verification}`)}</p></article>
        <article className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{t('supplierNotifications')}</p><p className="mt-2 text-3xl font-bold">{data.counts.notifications}</p></article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-semibold">{t('supplierProfile')}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${verificationTone}`}>{t(`verification${verification}`)}</span></div>
          {data.profile ? (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
              <div><dt className="text-slate-500">{t('supplierCompany')}</dt><dd className="mt-1 font-medium">{data.profile.identifiant_professionnel || data.profile.email_professionnel || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('supplierContact')}</dt><dd className="mt-1 break-all font-medium">{data.profile.email_professionnel || '—'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">{t('supplierDescription')}</dt><dd className="mt-1 whitespace-pre-line">{data.profile.description || t('supplierDescriptionEmpty')}</dd></div>
            </dl>
          ) : <p className="mt-5 text-sm text-slate-500">{t('supplierProfileMissing')}</p>}
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">{t('supplierNextSteps')}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between gap-3"><span>{t('supplierDocuments')}</span><Link to="/supplier/documents" className="font-semibold text-blue-700">{t('view')}</Link></li>
            <li className="flex justify-between gap-3"><span>{t('supplierProfile')}</span><Link to="/supplier/profile" className="font-semibold text-blue-700">{t('view')}</Link></li>
            <li className="flex justify-between gap-3"><span>{t('supplierNotifications')}</span><Link to="/supplier/notifications" className="font-semibold text-blue-700">{t('view')}</Link></li>
          </ul>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">{t('supplierRecentDocuments')}</h2>
        {data.documents.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="pb-3">{t('reference')}</th><th className="pb-3">{t('supplierDocumentType')}</th><th className="pb-3">{t('status')}</th><th className="pb-3">{t('createdAt')}</th></tr></thead>
              <tbody>{data.documents.slice(0, 5).map((document) => <tr key={document.id_document} className="border-b last:border-0"><td className="py-3 font-mono">{document.reference_document}</td><td>{document.type_document}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{statusLabel(document.statut)}</span></td><td>{formatDate(document.created_at)}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="mt-4 text-sm text-slate-500">{t('supplierNoDocuments')}</p>}
      </section>
    </div>
  );
};

export default SupplierDashboardPage;
