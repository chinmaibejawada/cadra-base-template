import { Request, Response } from 'express';
import { FarmService } from '../services/farmService';

const farmService = new FarmService();

export const farmController = {
  async list(_req: Request, res: Response): Promise<void> {
    const farms = await farmService.findAll();
    res.json({ data: farms, count: farms.length });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const farm = await farmService.findById(id);
    res.json({ data: farm });
  },

  async create(req: Request, res: Response): Promise<void> {
    const farm = await farmService.create(req.body);
    res.status(201).json({ data: farm });
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const farm = await farmService.update(id, req.body);
    res.json({ data: farm });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await farmService.softDelete(id);
    res.status(204).send();
  },
};