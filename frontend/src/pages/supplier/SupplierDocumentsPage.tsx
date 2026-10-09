import React, { useEffect, useState } from 'react';
import { getSupplierDocuments } from '../../services/supplierService';
import { useI18n } from '../../i18n/I18nProvider';

const SupplierDocumentsPage: React.FC = () => {
  const { t } = useI18n();
  const [documents, setDocuments] = useState<Awaited<ReturnType<typeof getSupplierDocuments>>> ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSupplierDocuments().then((result) => active && setDocuments(result)).catch((caught) => active && setError(caught instanceof Error ? caught.message : t('error'))).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;
  if (error) return <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</section>;

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-blue-700">{t('supplierWorkspace')}</p><h1 className="mt-1 text-2xl font-bold">{t('supplierDocuments')}</h1></div>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        {documents.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="pb-3">{t('reference')}</th><th className="pb-3">{t('supplierDocumentType')}</th><th className="pb-3">{t('status')}</th><th className="pb-3">{t('createdAt')}</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id_document} className="border-b last:border-0"><td className="py-3 font-mono">{document.reference_document}</td><td>{document.type_document}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{document.statut}</span></td><td>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(document.created_at))}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">{t('supplierNoDocuments')}</p>}
      </section>
    </div>
  );
};

export default SupplierDocumentsPage;
