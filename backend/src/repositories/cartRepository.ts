import { Pool } from 'pg';
import { CartSummary, CartItemRow, CartItemDetail } from '../types/order';

export class CartRepository {
  constructor(private pool: Pool) {}

  async ensureCart(userId: string): Promise<{ id_cart: string; id_client: string }> {
    const existing = await this.pool.query(
      'SELECT id_cart, id_client FROM carts WHERE id_client = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const created = await this.pool.query(
      'INSERT INTO carts (id_client) VALUES ($1) RETURNING id_cart, id_client',
      [userId]
    );

    return created.rows[0];
  }

  async getByUser(userId: string): Promise<CartSummary | null> {
    const cart = await this.ensureCart(userId);

    const itemsResult = await this.pool.query(
      `SELECT ci.id_cart_item, ci.id_product, p.nom AS product_name, ci.quantite,
              p.prix_detail AS unit_price,
              (ci.quantite * p.prix_detail) AS subtotal,
              COALESCE(i.quantite_disponible, 0) AS available_stock
       FROM cart_items ci
       JOIN products p ON p.id_product = ci.id_product
       LEFT JOIN inventory i ON i.id_product = p.id_product
       WHERE ci.id_cart = $1
       ORDER BY ci.created_at ASC`,
      [cart.id_cart]
    );

    const items: CartItemDetail[] = itemsResult.rows.map((row) => ({
      id_cart_item: row.id_cart_item,
      id_product: row.id_product,
      productName: row.product_name,
      quantity: Number(row.quantite),
      price: Number(row.unit_price),
      subtotal: Number(row.subtotal),
      availableStock: Number(row.available_stock)
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id_cart: cart.id_cart,
      id_client: cart.id_client,
      items,
      total
    };
  }

  async upsertItem(userId: string, productId: string, quantity: number): Promise<CartItemRow> {
    const cart = await this.ensureCart(userId);

    const existing = await this.pool.query(
      'SELECT id_cart_item, quantite FROM cart_items WHERE id_cart = $1 AND id_product = $2',
      [cart.id_cart, productId]
    );

    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantite + quantity;
      const updated = await this.pool.query(
        'UPDATE cart_items SET quantite = $1, updated_at = NOW() WHERE id_cart_item = $2 RETURNING *',
        [newQty, existing.rows[0].id_cart_item]
      );
      return updated.rows[0];
    }

    const inserted = await this.pool.query(
      'INSERT INTO cart_items (id_cart, id_product, quantite) VALUES ($1, $2, $3) RETURNING *',
      [cart.id_cart, productId, quantity]
    );
    return inserted.rows[0];
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItemRow | null> {
    const result = await this.pool.query(
      'UPDATE cart_items SET quantite = $1, updated_at = NOW() WHERE id_cart_item = $2 RETURNING *',
      [quantity, itemId]
    );
    return result.rows[0] || null;
  }

  async removeItem(itemId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM cart_items WHERE id_cart_item = $1 RETURNING id_cart_item',
      [itemId]
    );
    return result.rows.length > 0;
  }

  async clear(userId: string): Promise<boolean> {
    const cart = await this.ensureCart(userId);
    const result = await this.pool.query(
      'DELETE FROM cart_items WHERE id_cart = $1 RETURNING id_cart_item',
      [cart.id_cart]
    );
    return result.rows.length >= 0;
  }

  async getCartItemsForOrder(userId: string): Promise<CartItemRow[]> {
    const cart = await this.ensureCart(userId);
    const result = await this.pool.query(
      'SELECT * FROM cart_items WHERE id_cart = $1 ORDER BY created_at ASC',
      [cart.id_cart]
    );
    return result.rows;
  }

  async getCartItemByIdForUser(userId: string, itemId: string): Promise<CartItemRow | null> {
    const cart = await this.ensureCart(userId);
    const result = await this.pool.query(
      'SELECT * FROM cart_items WHERE id_cart = $1 AND id_cart_item = $2',
      [cart.id_cart, itemId]
    );
    return result.rows[0] || null;
  }

  async getCartForOwnershipCheck(userId: string): Promise<{ id_cart: string; id_client: string } | null> {
    const result = await this.pool.query(
      'SELECT id_cart, id_client FROM carts WHERE id_client = $1',
      [userId]
    );
    return result.rows[0] || null;
  }
}
