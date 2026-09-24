import { Pool } from 'pg';
import { Product, ProductWithCategories } from '../types/catalog';

export interface ProductCatalogQuery {
  profile?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export class ProductRepository {
  constructor(private pool: Pool) {}

  async create(productData: {
    id_fournisseur: string;
    nom: string;
    description?: string | null;
    categorie?: string | null;
    prix_detail: number;
    prix_gros: number;
  }): Promise<Product> {
    const result = await this.pool.query(
      `INSERT INTO products (id_fournisseur, nom, description, categorie, prix_detail, prix_gros)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_product, id_fournisseur, nom, description, categorie, prix_detail, prix_gros, created_at, updated_at`,
      [
        productData.id_fournisseur,
        productData.nom,
        productData.description ?? null,
        productData.categorie ?? null,
        productData.prix_detail,
        productData.prix_gros
      ]
    );

    return result.rows[0];
  }

  async attachCategories(productId: string, categoryIds: string[]): Promise<void> {
    if (!categoryIds || categoryIds.length === 0) {
      return;
    }

    const values: any[] = [];
    const insertClauses: string[] = [];

    categoryIds.forEach((categoryId, index) => {
      values.push(productId, categoryId);
      insertClauses.push(`($${index * 2 + 1}, $${index * 2 + 2})`);
    });

    await this.pool.query(
      `INSERT INTO product_categories (id_product, id_category)
       VALUES ${insertClauses.join(', ')}
       ON CONFLICT (id_product, id_category) DO NOTHING`,
      values
    );
  }

  async getCategoriesByProduct(productId: string): Promise<string[]> {
    const result = await this.pool.query(
      `SELECT c.nom
       FROM product_categories pc
       JOIN categories c ON c.id_category = pc.id_category
       WHERE pc.id_product = $1
       ORDER BY c.nom ASC`,
      [productId]
    );

    return result.rows.map((row) => row.nom);
  }

  async findById(id: string): Promise<ProductWithCategories | null> {
    const result = await this.pool.query(
      `SELECT p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
              p.created_at, p.updated_at,
              COALESCE(array_agg(DISTINCT c.nom) FILTER (WHERE c.nom IS NOT NULL), ARRAY[]::text[]) AS categories
       FROM products p
       LEFT JOIN product_categories pc ON pc.id_product = p.id_product
       LEFT JOIN categories c ON c.id_category = pc.id_category
       WHERE p.id_product = $1
       GROUP BY p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
                p.created_at, p.updated_at`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      ...row,
      categories: row.categories || [],
      effective_price: row.prix_detail
    };
  }

  async findAll(page = 1, limit = 10, search = ''): Promise<{ products: ProductWithCategories[]; total: number; page: number; limit: number; totalPages: number }> {
    const normalizedSearch = search.trim();
    const values: any[] = [];
    const clauses: string[] = [];
    let index = 1;

    if (normalizedSearch) {
      clauses.push(`(p.nom ILIKE $${index++} OR p.description ILIKE $${index++} OR p.categorie ILIKE $${index++})`);
      values.push(`%${normalizedSearch}%`, `%${normalizedSearch}%`, `%${normalizedSearch}%`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(DISTINCT p.id_product)::int AS total
       FROM products p
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * limit;

    const result = await this.pool.query(
      `SELECT p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
              p.created_at, p.updated_at,
              COALESCE(array_agg(DISTINCT c.nom) FILTER (WHERE c.nom IS NOT NULL), ARRAY[]::text[]) AS categories
       FROM products p
       LEFT JOIN product_categories pc ON pc.id_product = p.id_product
       LEFT JOIN categories c ON c.id_category = pc.id_category
       ${whereClause}
       GROUP BY p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
                p.created_at, p.updated_at
       ORDER BY p.created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    return {
      products: result.rows.map((row) => ({
        ...row,
        categories: row.categories || [],
        effective_price: row.prix_detail
      })),
      total,
      page: safePage,
      limit,
      totalPages
    };
  }

  async getAvailableStock(productId: string): Promise<number> {
    const result = await this.pool.query(
      'SELECT quantite_disponible FROM inventory WHERE id_product = $1',
      [productId]
    );

    return result.rows.length > 0 ? Number(result.rows[0].quantite_disponible) : 0;
  }

  async decrementStock(productId: string, quantity: number): Promise<number> {
    const result = await this.pool.query(
      `UPDATE inventory
       SET quantite_disponible = quantite_disponible - $1, last_updated = NOW()
       WHERE id_product = $2
       RETURNING quantite_disponible`,
      [quantity, productId]
    );

    return Number(result.rows[0]?.quantite_disponible ?? 0);
  }

  async incrementStock(productId: string, quantity: number): Promise<number> {
    const result = await this.pool.query(
      `UPDATE inventory
       SET quantite_disponible = quantite_disponible + $1, last_updated = NOW()
       WHERE id_product = $2
       RETURNING quantite_disponible`,
      [quantity, productId]
    );

    return Number(result.rows[0]?.quantite_disponible ?? 0);
  }

  async findCatalog(filters: ProductCatalogQuery = {}): Promise<{ products: ProductWithCategories[]; total: number; page: number; limit: number; totalPages: number }> {
    const profile = (filters.profile || 'CLIENT').toUpperCase();
    const search = (filters.search || '').trim();
    const category = (filters.category || '').trim();
    const minPrice = typeof filters.minPrice === 'number' ? filters.minPrice : undefined;
    const maxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : undefined;
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || 10));

    const clauses: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (search) {
      clauses.push(`(p.nom ILIKE $${index++} OR p.description ILIKE $${index++} OR p.categorie ILIKE $${index++})`);
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      clauses.push(`LOWER(c.nom) = LOWER($${index++})`);
      values.push(category);
    }

    if (minPrice !== undefined) {
      clauses.push(`CASE WHEN $${index} IN ('CLIENT') THEN p.prix_detail ELSE p.prix_gros END >= $${index + 1}`);
      values.push(profile, minPrice);
      index += 2;
    }

    if (maxPrice !== undefined) {
      clauses.push(`CASE WHEN $${index} IN ('CLIENT') THEN p.prix_detail ELSE p.prix_gros END <= $${index + 1}`);
      values.push(profile, maxPrice);
      index += 2;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(DISTINCT p.id_product)::int AS total
       FROM products p
       LEFT JOIN product_categories pc ON pc.id_product = p.id_product
       LEFT JOIN categories c ON c.id_category = pc.id_category
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * limit;

    const result = await this.pool.query(
      `SELECT p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
              p.created_at, p.updated_at,
              COALESCE(array_agg(DISTINCT c.nom) FILTER (WHERE c.nom IS NOT NULL), ARRAY[]::text[]) AS categories,
              CASE
                WHEN $${index} IN ('CLIENT') THEN p.prix_detail
                ELSE p.prix_gros
              END AS effective_price
       FROM products p
       LEFT JOIN product_categories pc ON pc.id_product = p.id_product
       LEFT JOIN categories c ON c.id_category = pc.id_category
       ${whereClause}
       GROUP BY p.id_product, p.id_fournisseur, p.nom, p.description, p.categorie, p.prix_detail, p.prix_gros,
                p.created_at, p.updated_at
       ORDER BY p.created_at DESC
       LIMIT $${index + 1} OFFSET $${index + 2}`,
      [...values, profile, limit, offset]
    );

    return {
      products: result.rows.map((row) => ({
        ...row,
        categories: row.categories || [],
        effective_price: row.effective_price ?? row.prix_detail
      })),
      total,
      page: safePage,
      limit,
      totalPages
    };
  }
}
