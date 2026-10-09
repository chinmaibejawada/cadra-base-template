import { Request, Response } from 'express';
import { ProductService } from '../services/productService';

const productService = new ProductService();

export const productController = {
  async list(_req: Request, res: Response): Promise<void> {
    const products = await productService.findAll();
    res.json({ data: products, count: products.length });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const product = await productService.findById(id);
    res.json({ data: product });
  },

  async create(req: Request, res: Response): Promise<void> {
    const product = await productService.create(req.body);
    res.status(201).json({ data: product });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const product = await productService.update(id, req.body);
    res.json({ data: product });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await productService.softDelete(id);
    res.status(204).send();
  },

  async lowStock(_req: Request, res: Response): Promise<void> {
    const products = await productService.getLowStock();
    res.json({ data: products, count: products.length });
  },
};