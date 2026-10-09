import { Request, Response } from 'express';
import { NoteService } from '../services/noteService';

const noteService = new NoteService();

export const noteController = {
  async list(req: Request, res: Response): Promise<void> {
    const { type, id } = req.query;
    if (!type || !id) {
      res.status(400).json({ error: true, message: 'type and id query params are required' });
      return;
    }
    const notes = await noteService.findByTarget(type as 'order' | 'farm' | 'product', parseInt(id as string, 10));
    res.json({ data: notes, count: notes.length });
  },

  async create(req: Request, res: Response): Promise<void> {
    const note = await noteService.create(req.body);
    res.status(201).json({ data: note });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await noteService.delete(id);
    res.status(204).send();
  },
};