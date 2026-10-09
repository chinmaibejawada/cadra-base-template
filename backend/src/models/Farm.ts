import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FarmAttributes {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FarmCreationAttributes extends Optional<FarmAttributes, 'id' | 'address' | 'city' | 'state' | 'zipCode' | 'phone' | 'email' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Farm extends Model<FarmAttributes, FarmCreationAttributes> implements FarmAttributes {
  declare id: number;
  declare name: string;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare zipCode: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Farm.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'zip_code',
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'farms',
    underscored: true,
  }
);