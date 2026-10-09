import { Note } from '../models';
import { AppError } from '../middleware/errorHandler';
import type { CreateNoteInput } from '../validators/noteSchema';
import type { NotableType } from '../models/Note';

export class NoteService {
  async findByTarget(notableType: NotableType, notableId: number): Promise<Note[]> {
    return Note.findAll({
      where: { notableType, notableId },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: CreateNoteInput): Promise<Note> {
    return Note.create(data);
  }

  async delete(id: number): Promise<void> {
    const note = await Note.findByPk(id);
    if (!note) {
      throw new AppError(404, `Note with id ${id} not found`, 'NOTE_NOT_FOUND');
    }
    await note.destroy();
  }
}