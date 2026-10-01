import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogProduct, fetchCatalog } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';

const CatalogPage: React.FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog()
      .then((result) => setItems(result.data || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-4">{t('navCatalog')}</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id_product} className="py-3 flex justify-between">
            <div>
              <p className="font-medium">{item.nom}</p>
              <p className="text-sm text-gray-600">{item.categorie}</p>
            </div>
            <div className="text-end">
              <p>{item.effective_price ?? item.prix_detail}</p>
              <Link className="text-blue-700 text-sm" to={`/catalog/${item.id_product}`}>
                {t('details')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CatalogPage;
