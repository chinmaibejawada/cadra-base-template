import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProductAttributes {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  unitPrice: number;
  currentStock: number;
  reorderPoint: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'category' | 'currentStock' | 'reorderPoint' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number;
  declare sku: string;
  declare name: string;
  declare description: string | null;
  declare category: string | null;
  declare unit: string;
  declare unitPrice: number;
  declare currentStock: number;
  declare reorderPoint: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
      field: 'current_stock',
    },
    reorderPoint: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
      field: 'reorder_point',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'products',
    underscored: true,
  }
);