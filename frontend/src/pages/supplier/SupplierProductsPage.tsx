import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCatalog, CatalogProduct } from '../../services/commerceService';
import {
  PageHeader,
  Badge,
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '../../components/ui';
import { formatPrice } from '../../lib/format';

/**
 * Page Produits fournisseur — affiche le catalogue disponible.
 * Note : l'API ne filtre pas encore par fournisseur connecté.
 * Quand ce filtrage sera disponible côté backend, remplacer fetchCatalog()
 * par un appel à /api/v1/suppliers/me/products.
 */
const SupplierProductsPage: React.FC = () => {
  const { t } = useI18n();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog()
      .then((result) => setProducts(result.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierNavProducts')}
        description={t('supplierWorkspace')}
      />

      {/* Note sur le filtrage */}
      <div className="flex items-start gap-3 rounded-xl border border-info-100 bg-info-50 px-4 py-3">
        <span className="text-info-500 text-sm">ℹ</span>
        <p className="text-sm text-info-700">
          {t('supplierProductsDescription')}
        </p>
      </div>

      <DataTable
        loading={loading}
        error={error}
        empty={products.length === 0}
        emptyTitle="Aucun produit"
        cols={4}
      >
        <Table>
          <TableHeader>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id_product}>
                <TableCell>
                  <span className="font-medium">{p.nom}</span>
                </TableCell>
                <TableCell muted>{p.categorie ?? '—'}</TableCell>
                <TableCell>
                  <span className="font-semibold text-nextrade-blue">
                    {formatPrice(p.effective_price ?? p.prix_detail)}
                  </span>
                </TableCell>
                <TableCell>
                  {p.stock_status === 'OUT' ? (
                    <Badge variant="danger">Rupture</Badge>
                  ) : p.stock_status === 'LOW' ? (
                    <Badge variant="warning">Faible</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  );
};

export default SupplierProductsPage;
