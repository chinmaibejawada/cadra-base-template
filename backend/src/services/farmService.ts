import { Farm } from '../models';
import { AppError } from '../middleware/errorHandler';
import type { CreateFarmInput, UpdateFarmInput } from '../validators/farmSchema';

export class FarmService {
  async findAll(): Promise<Farm[]> {
    return Farm.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  }

  async findById(id: number): Promise<Farm> {
    const farm = await Farm.findByPk(id);
    if (!farm || !farm.isActive) {
      throw new AppError(404, `Farm with id ${id} not found`, 'FARM_NOT_FOUND');
    }
    return farm;
  }

  async create(data: CreateFarmInput): Promise<Farm> {
    return Farm.create(data);
  }

  async update(id: number, data: UpdateFarmInput): Promise<Farm> {
    const farm = await this.findById(id);
    await farm.update(data);
    return farm;
  }

  async softDelete(id: number): Promise<void> {
    const farm = await this.findById(id);
    await farm.update({ isActive: false });
  }
}