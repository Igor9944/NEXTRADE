import React, { useEffect, useMemo, useState } from 'react';
import { CatalogProduct, fetchCatalog } from '../../services/commerceService';
import { useI18n } from '../../i18n/I18nProvider';
import { PageHeader, EmptyState, SkeletonCard } from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProductCard } from '../../components/business/ProductCard';
import { IconSearch } from '../../components/icons';

type SortKey = 'nom_asc' | 'nom_desc' | 'price_asc' | 'price_desc';

const sortOptions = [
  { value: 'nom_asc', label: 'Nom A → Z' },
  { value: 'nom_desc', label: 'Nom Z → A' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const CatalogPage: React.FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<SortKey>('nom_asc');

  useEffect(() => {
    fetchCatalog()
      .then((result) => setItems(result.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((p) => p.categorie).filter(Boolean))) as string[],
    [items]
  );

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          (p.categorie?.toLowerCase().includes(q) ?? false)
      );
    }
    if (category) {
      result = result.filter((p) => p.categorie === category);
    }
    result = [...result].sort((a, b) => {
      const priceA = Number(a.effective_price ?? a.prix_detail ?? 0);
      const priceB = Number(b.effective_price ?? b.prix_detail ?? 0);
      if (sort === 'nom_asc') return a.nom.localeCompare(b.nom);
      if (sort === 'nom_desc') return b.nom.localeCompare(a.nom);
      if (sort === 'price_asc') return priceA - priceB;
      if (sort === 'price_desc') return priceB - priceA;
      return 0;
    });
    return result;
  }, [items, search, category, sort]);

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('navCatalog')}
        description={`${items.length > 0 ? `${items.length} produits` : ''}`}
      />

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<IconSearch className="h-4 w-4" />}
            aria-label="Recherche produit"
          />
        </div>
        <Select
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-52"
          aria-label="Filtrer par catégorie"
        />
        <Select
          options={sortOptions}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-full sm:w-48"
          aria-label="Trier par"
        />
      </div>

      {/* Erreur */}
      {error && (
        <EmptyState variant="error" title="Erreur de chargement" description={error} />
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Grille de produits */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>
      )}

      {/* Vide */}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          variant={search || category ? 'search' : 'empty'}
          title={search || category ? 'Aucun résultat' : 'Catalogue vide'}
          description={
            search || category
              ? 'Modifiez votre recherche ou les filtres.'
              : 'Aucun produit disponible pour le moment.'
          }
        />
      )}
    </div>
  );
};

export default CatalogPage;
