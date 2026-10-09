import { Product } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op, Sequelize } from 'sequelize';
import type { CreateProductInput, UpdateProductInput } from '../validators/productSchema';

export class ProductService {
  async findAll(): Promise<Product[]> {
    return Product.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  }

  async findById(id: number): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product || !product.isActive) {
      throw new AppError(404, `Product with id ${id} not found`, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return Product.findOne({ where: { sku, isActive: true } });
  }

  async create(data: CreateProductInput): Promise<Product> {
    const existing = await this.findBySku(data.sku);
    if (existing) {
      throw new AppError(409, `Product with SKU '${data.sku}' already exists`, 'SKU_DUPLICATE');
    }
    return Product.create(data);
  }

  async update(id: number, data: UpdateProductInput): Promise<Product> {
    const product = await this.findById(id);
    if (data.sku && data.sku !== product.sku) {
      const existing = await this.findBySku(data.sku);
      if (existing) {
        throw new AppError(409, `Product with SKU '${data.sku}' already exists`, 'SKU_DUPLICATE');
      }
    }
    await product.update(data);
    return product;
  }

  async softDelete(id: number): Promise<void> {
    const product = await this.findById(id);
    await product.update({ isActive: false });
  }

  async getLowStock(): Promise<Product[]> {
    return Product.findAll({
      where: {
        isActive: true,
        currentStock: { [Op.lte]: Sequelize.col('reorder_point') },
      },
    });
  }
}