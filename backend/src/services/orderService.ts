import { CartRepository } from '../repositories/cartRepository';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { UserRepository } from '../repositories/userRepository';
import { OrderStatus } from '../types/order';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository,
    private productRepository: ProductRepository,
    private userRepository: UserRepository
  ) {}

  private formatMoney(value: number): string {
    return Number(value).toFixed(2);
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  }

  async createOrder(userId: string, payload: { adresse_livraison?: string | null } = {}) {
    await this.ensureUserExists(userId);

    const cart = await this.cartRepository.getByUser(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderLines: Array<{ id_product: string; quantite: number; prix_unitaire_fige: number }> = [];
    let total = 0;

    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.id_product);
      if (!product) {
        throw new Error('One or more products no longer exist');
      }

      const availableStock = await this.productRepository.getAvailableStock(item.id_product);
      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.nom}`);
      }

      const unitPrice = Number(product.prix_detail);
      total += unitPrice * item.quantity;
      orderLines.push({
        id_product: item.id_product,
        quantite: item.quantity,
        prix_unitaire_fige: unitPrice
      });
    }

    const order = await this.orderRepository.createOrder({
      id_client: userId,
      montant_total: total,
      statut: 'EN_ATTENTE',
      adresse_livraison: payload.adresse_livraison ?? null
    });

    await this.orderRepository.createOrderItems(
      orderLines.map((line) => ({
        id_order: order.id_order,
        ...line
      }))
    );

    for (const line of orderLines) {
      await this.productRepository.decrementStock(line.id_product, line.quantite);
    }

    await this.cartRepository.clear(userId);
    await this.orderRepository.addStatusHistory(order.id_order, 'EN_ATTENTE');

    return {
      ...order,
      montant_total: this.formatMoney(Number(order.montant_total)),
      statut: order.statut as OrderStatus
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.id_client !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      ...order,
      montant_total: this.formatMoney(Number(order.montant_total)),
      statut: order.statut as OrderStatus
    };
  }

  async getUserOrders(userId: string) {
    const orders = await this.orderRepository.getByUser(userId);
    return orders.map((order) => ({
      ...order,
      montant_total: this.formatMoney(Number(order.montant_total)),
      statut: order.statut as OrderStatus
    }));
  }

  async updateStatus(userId: string, orderId: string, statut: OrderStatus) {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.id_client !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.statut === 'ANNULEE' && statut !== 'ANNULEE') {
      throw new Error('Cancelled orders cannot be reactivated');
    }

    if (statut === 'ANNULEE' && order.statut !== 'ANNULEE') {
      const items = await this.orderRepository.getOrderItems(orderId);
      for (const item of items) {
        await this.productRepository.incrementStock(item.id_product, item.quantite);
      }
    }

    const updated = await this.orderRepository.updateStatus(orderId, statut);
    if (!updated) {
      throw new Error('Failed to update order status');
    }

    await this.orderRepository.addStatusHistory(orderId, statut);

    return {
      ...updated,
      montant_total: this.formatMoney(Number(updated.montant_total)),
      statut: updated.statut as OrderStatus
    };
  }
}
