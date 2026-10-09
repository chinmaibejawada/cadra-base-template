import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderAttributes {
  id: number;
  orderNumber: string;
  farmId: number;
  status: OrderStatus;
  orderDate: Date;
  requestedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  idempotencyKey: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'requestedDeliveryDate' | 'actualDeliveryDate' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'notes' | 'idempotencyKey' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: number;
  declare orderNumber: string;
  declare farmId: number;
  declare status: OrderStatus;
  declare orderDate: Date;
  declare requestedDeliveryDate: Date | null;
  declare actualDeliveryDate: Date | null;
  declare subtotal: number;
  declare taxAmount: number;
  declare totalAmount: number;
  declare notes: string | null;
  declare idempotencyKey: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    farmId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'farm_id',
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'draft',
    },
    orderDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'order_date',
    },
    requestedDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'requested_delivery_date',
    },
    actualDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'actual_delivery_date',
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'tax_amount',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'total_amount',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idempotencyKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'idempotency_key',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    underscored: true,
  }
);