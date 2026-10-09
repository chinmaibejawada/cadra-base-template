import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';

const orderService = new OrderService();

export const orderController = {
  async list(req: Request, res: Response): Promise<void> {
    const { farmId, status } = req.query;
    const filters: { farmId?: number; status?: string } = {};
    if (farmId) filters.farmId = parseInt(farmId as string, 10);
    if (status) filters.status = status as string;
    const orders = await orderService.findAll(filters);
    res.json({ data: orders, count: orders.length });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const order = await orderService.findById(id);
    res.json({ data: order });
  },

  async create(req: Request, res: Response): Promise<void> {
    const order = await orderService.create(req.body);
    res.status(201).json({ data: order });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const order = await orderService.updateOrder(id, req.body);
    res.json({ data: order });
  },

  async transitionStatus(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const order = await orderService.transitionStatus(id, req.body);
    res.json({ data: order });
  },

  async cancel(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const order = await orderService.cancelOrder(id);
    res.json({ data: order });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await orderService.deleteDraft(id);
    res.status(204).send();
  },
};