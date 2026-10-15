import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addCartItem, CatalogProduct, fetchProduct } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
} from '../../components/ui';
import { formatPrice } from '../../lib/format';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then((result) => setProduct(result.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        variant="error"
        title="Produit introuvable"
        description={error ?? "Ce produit n'existe pas ou a été retiré."}
        action={
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            Retour au catalogue
          </Button>
        }
      />
    );
  }

  const price = product.effective_price ?? product.prix_detail;
  const isOut = product.stock_status === 'OUT';

  const stockBadgeVariant = isOut
    ? 'danger'
    : product.stock_status === 'LOW'
    ? 'warning'
    : 'success';

  const stockLabel = isOut
    ? t('stockOut')
    : product.stock_status === 'LOW'
    ? t('stockLow')
    : t('stockOk');

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.nom}
        breadcrumbs={[
          { label: t('navCatalog'), href: '/catalog' },
          { label: product.nom },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Image */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[4/3] overflow-hidden rounded-xl3 bg-nextrade-soft">
              {(product as unknown as { image_url?: string }).image_url ? (
                <img
                  src={(product as unknown as { image_url: string }).image_url}
                  alt={product.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl text-nextrade-muted/20">
                  📦
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Détails */}
        <div className="space-y-4">
          <Card>
            <CardContent>
              {product.categorie && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-nextrade-muted">
                  {product.categorie}
                </p>
              )}
              <h2 className="text-xl font-bold text-nextrade-ink">{product.nom}</h2>

              {product.description && (
                <p className="mt-3 text-sm leading-6 text-nextrade-muted">
                  {product.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-2xl font-black text-nextrade-blue">
                  {price !== undefined && price !== null ? formatPrice(price) : '—'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={stockBadgeVariant}>{stockLabel}</Badge>
                  {product.stock_quantity !== undefined && (
                    <span className="text-xs text-nextrade-muted">
                      {product.stock_quantity} {t('stock')}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          <Button
            variant="primary"
            size="lg"
            loading={adding}
            disabled={isOut}
            className="w-full"
            onClick={async () => {
              if (!id) return;
              setAdding(true);
              try {
                await addCartItem(id);
                navigate('/orders');
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : t('error'));
              } finally {
                setAdding(false);
              }
            }}
          >
            {isOut ? 'Rupture de stock' : t('addToCart')}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-danger-500">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
