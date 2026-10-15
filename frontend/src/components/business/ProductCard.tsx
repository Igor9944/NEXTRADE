import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../lib/format';
import type { CatalogProduct } from '../../services/commerceService';

function StockBadge({ status }: { status?: string | null }) {
  if (status === 'OUT') return <Badge variant="danger">Rupture</Badge>;
  if (status === 'LOW') return <Badge variant="warning">Stock faible</Badge>;
  if (status === 'OK') return <Badge variant="success">Disponible</Badge>;
  return null;
}

interface ProductCardProps {
  product: CatalogProduct;
  showAddToCart?: boolean;
  onAddToCart?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const price = product.effective_price ?? product.prix_detail;

  return (
    <article className="group flex flex-col rounded-xl3 border border-nextrade-border bg-white shadow-card transition-all duration-250 hover:-translate-y-0.5 hover:shadow-panel overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-nextrade-soft">
        {(product as unknown as { image_url?: string }).image_url ? (
          <img
            src={(product as unknown as { image_url: string }).image_url}
            alt={product.nom}
            className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-nextrade-muted/30">
            📦
          </div>
        )}
        {/* Badge stock overlay */}
        <div className="absolute end-2 top-2">
          <StockBadge status={product.stock_status} />
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-4">
        {product.categorie && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-nextrade-muted">
            {product.categorie}
          </p>
        )}
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-nextrade-ink">
          {product.nom}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-nextrade-blue">
            {price !== undefined && price !== null ? formatPrice(price) : '—'}
          </p>
          <Link
            to={`/catalog/${product.id_product}`}
            className="text-xs font-semibold text-nextrade-blue hover:underline underline-offset-2"
          >
            Voir →
          </Link>
        </div>
      </div>
    </article>
  );
};
