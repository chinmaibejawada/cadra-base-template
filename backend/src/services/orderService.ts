import { Order, OrderLine, Product, Farm } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import type { CreateOrderInput, UpdateOrderInput, StatusTransitionInput } from '../validators/orderSchema';
import type { OrderStatus } from '../models/Order';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const TAX_RATE = 0.07;

export class OrderService {
  async findAll(filters?: { farmId?: number; status?: string }): Promise<Order[]> {
    const where: Record<string, unknown> = {};
    if (filters?.farmId) where.farmId = filters.farmId;
    if (filters?.status) where.status = filters.status;
    return Order.findAll({
      where,
      include: [{ model: Farm, as: 'farm', attributes: ['id', 'name', 'city'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: number, transaction?: any): Promise<Order> {
    const order = await Order.findByPk(id, {
      transaction,
      include: [
        { model: Farm, as: 'farm' },
        {
          model: OrderLine,
          as: 'orderLines',
          include: [{ model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'unit'] }],
        },
      ],
    });
    if (!order) {
      throw new AppError(404, `Order with id ${id} not found`, 'ORDER_NOT_FOUND');
    }
    return order;
  }

  async create(data: CreateOrderInput): Promise<Order> {
    if (data.idempotencyKey) {
      const existing = await Order.findOne({ where: { idempotencyKey: data.idempotencyKey } });
      if (existing) {
        return this.findById(existing.id);
      }
    }

    const farm = await Farm.findByPk(data.farmId);
    if (!farm || !farm.isActive) {
      throw new AppError(404, 'Farm not found', 'FARM_NOT_FOUND');
    }

    const orderNumber = await this.generateOrderNumber();

    return sequelize.transaction(async (transaction) => {
      const order = await Order.create(
        {
          orderNumber,
          farmId: data.farmId,
          orderDate: new Date(data.orderDate),
          requestedDeliveryDate: data.requestedDeliveryDate ? new Date(data.requestedDeliveryDate) : null,
          notes: data.notes || null,
          idempotencyKey: data.idempotencyKey || null,
          subtotal: 0,
          taxAmount: 0,
          totalAmount: 0,
        },
        { transaction }
      );

      let subtotal = 0;
      for (const line of data.lines) {
        const product = await Product.findByPk(line.productId, { transaction });
        if (!product || !product.isActive) {
          throw new AppError(404, `Product with id ${line.productId} not found`, 'PRODUCT_NOT_FOUND');
        }
        const unitPrice = Number(product.unitPrice);
        const lineTotal = line.quantity * unitPrice;
        subtotal += lineTotal;

        await OrderLine.create(
          {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice,
            lineTotal,
          },
          { transaction }
        );
      }

      const taxAmount = subtotal * TAX_RATE;
      const totalAmount = subtotal + taxAmount;

      await order.update(
        { subtotal, taxAmount, totalAmount },
        { transaction }
      );

      return this.findById(order.id, transaction);
    });
  }

  async updateOrder(id: number, data: UpdateOrderInput): Promise<Order> {
    const order = await this.findById(id);
    if (order.status !== 'draft') {
      throw new AppError(422, 'Only draft orders can be edited', 'ORDER_NOT_EDITABLE');
    }

    return sequelize.transaction(async (transaction) => {
      if (data.requestedDeliveryDate !== undefined) {
        await order.update({ requestedDeliveryDate: data.requestedDeliveryDate ? new Date(data.requestedDeliveryDate) : null }, { transaction });
      }
      if (data.notes !== undefined) {
        await order.update({ notes: data.notes }, { transaction });
      }

      if (data.lines) {
        await OrderLine.destroy({ where: { orderId: order.id }, transaction });

        let subtotal = 0;
        for (const line of data.lines) {
          const product = await Product.findByPk(line.productId, { transaction });
          if (!product || !product.isActive) {
            throw new AppError(404, `Product with id ${line.productId} not found`, 'PRODUCT_NOT_FOUND');
          }
          const unitPrice = Number(product.unitPrice);
          const lineTotal = line.quantity * unitPrice;
          subtotal += lineTotal;

          await OrderLine.create(
            { orderId: order.id, productId: line.productId, quantity: line.quantity, unitPrice, lineTotal },
            { transaction }
          );
        }

        const taxAmount = subtotal * TAX_RATE;
        const totalAmount = subtotal + taxAmount;
        await order.update({ subtotal, taxAmount, totalAmount }, { transaction });
      }

      return this.findById(order.id, transaction);
    });
  }

  async transitionStatus(id: number, data: StatusTransitionInput): Promise<Order> {
    const order = await this.findById(id);
    const currentStatus = order.status;
    const newStatus = data.status;

    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new AppError(
        422,
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    return sequelize.transaction(async (transaction) => {
      const orderLines = await OrderLine.findAll({
        where: { orderId: order.id },
        transaction,
      });

      if (newStatus === 'confirmed') {
        for (const line of orderLines) {
          const product = await Product.findByPk(line.productId, { transaction });
          if (!product) {
            throw new AppError(404, `Product with id ${line.productId} not found`, 'PRODUCT_NOT_FOUND');
          }
          if (Number(product.currentStock) < Number(line.quantity)) {
            throw new AppError(
              422,
              `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${line.quantity}`,
              'INSUFFICIENT_STOCK'
            );
          }
        }

        for (const line of orderLines) {
          await Product.decrement('currentStock', {
            by: Number(line.quantity),
            where: { id: line.productId },
            transaction,
          });
        }
      }

      if (newStatus === 'cancelled' && (currentStatus === 'confirmed' || currentStatus === 'shipped')) {
        for (const line of orderLines) {
          await Product.increment('currentStock', {
            by: Number(line.quantity),
            where: { id: line.productId },
            transaction,
          });
        }
      }

      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'shipped' && data.actualDeliveryDate) {
        updateData.actualDeliveryDate = new Date(data.actualDeliveryDate);
      }
      if (newStatus === 'delivered') {
        updateData.actualDeliveryDate = data.actualDeliveryDate ? new Date(data.actualDeliveryDate) : new Date();
      }

      await order.update(updateData, { transaction });
      return this.findById(order.id, transaction);
    });
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastOrder = await Order.findOne({
      where: { orderNumber: { [Op.like]: `PR-${year}-%` } },
      order: [['id', 'DESC']],
    });

    let nextSeq = 1;
    if (lastOrder) {
      const parts = lastOrder.orderNumber.split('-');
      nextSeq = parseInt(parts[2], 10) + 1;
    }

    return `PR-${year}-${String(nextSeq).padStart(5, '0')}`;
  }

  async cancelOrder(id: number): Promise<Order> {
    return this.transitionStatus(id, { status: 'cancelled' });
  }

  async deleteDraft(id: number): Promise<void> {
    const order = await this.findById(id);
    if (order.status !== 'draft') {
      throw new AppError(422, 'Only draft orders can be deleted', 'ORDER_NOT_DELETABLE');
    }
    await OrderLine.destroy({ where: { orderId: order.id } });
    await order.destroy();
  }
}