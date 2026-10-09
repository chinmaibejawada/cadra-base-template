import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderLineAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderLineCreationAttributes extends Optional<OrderLineAttributes, 'id' | 'lineTotal' | 'createdAt' | 'updatedAt'> {}

export class OrderLine extends Model<OrderLineAttributes, OrderLineCreationAttributes> implements OrderLineAttributes {
  declare id: number;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: number;
  declare lineTotal: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

OrderLine.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id',
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'product_id',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    lineTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'line_total',
    },
  },
  {
    sequelize,
    tableName: 'order_lines',
    underscored: true,
  }
);