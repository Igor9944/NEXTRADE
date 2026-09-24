import { CartRepository } from '../repositories/cartRepository';
import { ProductRepository } from '../repositories/productRepository';
import { CartSummary, CartItemRow } from '../types/order';

export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository,
    private getProductById: (id: string, profile?: string) => Promise<any>
  ) {}

  private normalizeQuantity(value: unknown): number {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }
    return quantity;
  }

  async getCart(userId: string): Promise<CartSummary | null> {
    return this.cartRepository.getByUser(userId);
  }

  async addItem(userId: string, productId: string, quantity: unknown): Promise<CartItemRow> {
    const normalizedQty = this.normalizeQuantity(quantity);
    const product = await this.getProductById(productId, 'CLIENT');

    if (!product) {
      throw new Error('Product not found');
    }

    const item = await this.cartRepository.upsertItem(userId, productId, normalizedQty);
    return item;
  }

  async updateItem(userId: string, itemId: string, quantity: unknown): Promise<CartItemRow | null> {
    const normalizedQty = this.normalizeQuantity(quantity);

    const item = await this.cartRepository.getCartItemByIdForUser(userId, itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    const product = await this.getProductById(item.id_product, 'CLIENT');
    if (!product) {
      throw new Error('Product not found');
    }

    return this.cartRepository.updateItemQuantity(itemId, normalizedQty);
  }

  async removeItem(userId: string, itemId: string): Promise<boolean> {
    const item = await this.cartRepository.getCartItemByIdForUser(userId, itemId);
    if (!item) {
      return false;
    }
    return this.cartRepository.removeItem(itemId);
  }

  async clearCart(userId: string): Promise<boolean> {
    return this.cartRepository.clear(userId);
  }
}
