import { Pool } from 'pg';
import { OrderRecord, OrderItemRecord, OrderStatus } from '../types/order';

export class OrderRepository {
  constructor(private pool: Pool) {}

  async createOrder(data: {
    id_client: string;
    montant_total: number;
    statut: OrderStatus;
    adresse_livraison?: string | null;
  }): Promise<OrderRecord> {
    const result = await this.pool.query(
      `INSERT INTO orders (id_client, montant_total, statut, adresse_livraison)
       VALUES ($1, $2, $3, $4)
       RETURNING id_order, id_client, montant_total, statut, adresse_livraison, created_at, updated_at`,
      [data.id_client, data.montant_total, data.statut, data.adresse_livraison ?? null]
    );
    return result.rows[0];
  }

  async createOrderItems(items: Array<{ id_order: string; id_product: string; quantite: number; prix_unitaire_fige: number }>): Promise<OrderItemRecord[]> {
    if (items.length === 0) {
      return [];
    }

    const insertClauses: string[] = [];
    const values: any[] = [];

    items.forEach((item, index) => {
      const base = index * 4;
      insertClauses.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      values.push(item.id_order, item.id_product, item.quantite, item.prix_unitaire_fige);
    });

    const query = `INSERT INTO order_items (id_order, id_product, quantite, prix_unitaire_fige)
                   VALUES ${insertClauses.join(', ')}
                   RETURNING id_item, id_order, id_product, quantite, prix_unitaire_fige`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getById(id_order: string): Promise<OrderRecord | null> {
    const result = await this.pool.query(
      `SELECT id_order, id_client, montant_total, statut, adresse_livraison, created_at, updated_at
       FROM orders WHERE id_order = $1`,
      [id_order]
    );
    return result.rows[0] || null;
  }

  async getByUser(userId: string): Promise<OrderRecord[]> {
    const result = await this.pool.query(
      `SELECT id_order, id_client, montant_total, statut, adresse_livraison, created_at, updated_at
       FROM orders WHERE id_client = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getOrderItems(id_order: string): Promise<OrderItemRecord[]> {
    const result = await this.pool.query(
      `SELECT id_item, id_order, id_product, quantite, prix_unitaire_fige
       FROM order_items WHERE id_order = $1 ORDER BY created_at ASC`,
      [id_order]
    );
    return result.rows;
  }

  async updateStatus(id_order: string, statut: OrderStatus): Promise<OrderRecord | null> {
    const result = await this.pool.query(
      `UPDATE orders SET statut = $1, updated_at = NOW()
       WHERE id_order = $2
       RETURNING id_order, id_client, montant_total, statut, adresse_livraison, created_at, updated_at`,
      [statut, id_order]
    );
    return result.rows[0] || null;
  }

  async addStatusHistory(id_order: string, statut: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO order_status_history (id_order, statut) VALUES ($1, $2)',
      [id_order, statut]
    );
  }
}
