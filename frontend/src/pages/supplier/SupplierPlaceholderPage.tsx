import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';

const SupplierPlaceholderPage: React.FC<{ titleKey: string; descriptionKey: string }> = ({ titleKey, descriptionKey }) => {
  const { t } = useI18n();
  return (
    <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t(descriptionKey)}</p>
      <Link to="/supplier/dashboard" className="mt-6 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">{t('supplierBackToDashboard')}</Link>
    </section>
  );
};

export default SupplierPlaceholderPage;
