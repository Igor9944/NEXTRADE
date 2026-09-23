import { Pool } from 'pg';
import { Category } from '../types/catalog';

export class CategoryRepository {
  constructor(private pool: Pool) {}

  async create(categoryData: { nom: string; description?: string | null }): Promise<Category> {
    const result = await this.pool.query(
      `INSERT INTO categories (nom, description)
       VALUES ($1, $2)
       RETURNING id_category, nom, description, created_at, updated_at`,
      [categoryData.nom, categoryData.description ?? null]
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.pool.query(
      `SELECT id_category, nom, description, created_at, updated_at
       FROM categories
       WHERE id_category = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async findByName(nom: string): Promise<Category | null> {
    const result = await this.pool.query(
      `SELECT id_category, nom, description, created_at, updated_at
       FROM categories
       WHERE LOWER(nom) = LOWER($1)`,
      [nom]
    );

    return result.rows[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) {
      return [];
    }

    const result = await this.pool.query(
      `SELECT id_category, nom, description, created_at, updated_at
       FROM categories
       WHERE id_category = ANY($1)
       ORDER BY nom ASC`,
      [ids]
    );

    return result.rows;
  }

  async findAll(page = 1, limit = 10, search = ''): Promise<{ categories: Category[]; total: number; page: number; limit: number; totalPages: number }> {
    const normalizedSearch = search.trim();
    const values: any[] = [];
    const clauses: string[] = [];
    let index = 1;

    if (normalizedSearch) {
      clauses.push(`(nom ILIKE $${index++} OR description ILIKE $${index++})`);
      values.push(`%${normalizedSearch}%`, `%${normalizedSearch}%`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM categories
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * limit;

    const result = await this.pool.query(
      `SELECT id_category, nom, description, created_at, updated_at
       FROM categories
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    return {
      categories: result.rows,
      total,
      page: safePage,
      limit,
      totalPages
    };
  }
}
