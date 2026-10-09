import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NotableType = 'order' | 'farm' | 'product';

export interface NoteAttributes {
  id: number;
  notableType: NotableType;
  notableId: number;
  content: string;
  author: string | null;
  isInternal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'author' | 'isInternal' | 'createdAt' | 'updatedAt'> {}

export class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  declare id: number;
  declare notableType: NotableType;
  declare notableId: number;
  declare content: string;
  declare author: string | null;
  declare isInternal: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    notableType: {
      type: DataTypes.ENUM('order', 'farm', 'product'),
      allowNull: false,
      field: 'notable_type',
    },
    notableId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'notable_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_internal',
    },
  },
  {
    sequelize,
    tableName: 'notes',
    underscored: true,
    indexes: [
      {
        name: 'idx_notable',
        fields: ['notable_type', 'notable_id'],
      },
    ],
  }
);