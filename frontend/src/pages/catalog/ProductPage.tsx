import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addCartItem, CatalogProduct, fetchProduct } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then((result) => setProduct(result.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>;
  if (!product) return <div className="bg-white rounded-lg shadow p-6">{t('loading')}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-3">
      <h1 className="text-xl font-bold">{product.nom}</h1>
      <p>{product.description || '—'}</p>
      <p>{t('kpiProducts')}: {product.categorie}</p>
      <p className="font-semibold">{product.effective_price ?? product.prix_detail}</p>
      <p>
        {t('stock')}: {product.stock_quantity ?? '—'}{' '}
        {product.stock_status === 'OUT' ? t('stockOut') : product.stock_status === 'LOW' ? t('stockLow') : t('stockOk')}
      </p>
      <button
        className="bg-blue-700 text-white rounded px-4 py-2"
        onClick={() =>
          addCartItem(product.id_product)
            .then(() => navigate('/orders'))
            .catch((err) => setError(err.message))
        }
      >
        {t('addToCart')}
      </button>
    </div>
  );
};

export default ProductPage;
