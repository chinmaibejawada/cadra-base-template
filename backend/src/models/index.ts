import { Farm } from './Farm';
import { Product } from './Product';
import { Order } from './Order';
import { OrderLine } from './OrderLine';
import { Note } from './Note';

Farm.hasMany(Order, { foreignKey: 'farmId', as: 'orders' });
Order.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });

Order.hasMany(OrderLine, { foreignKey: 'orderId', as: 'orderLines', onDelete: 'CASCADE' });
OrderLine.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderLine.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderLine, { foreignKey: 'productId', as: 'orderLines' });

Note.belongsTo(Farm, { foreignKey: 'notableId', constraints: false, as: 'farmNote' });
Note.belongsTo(Order, { foreignKey: 'notableId', constraints: false, as: 'orderNote' });
Note.belongsTo(Product, { foreignKey: 'notableId', constraints: false, as: 'productNote' });

export { Farm, Product, Order, OrderLine, Note };
export { sequelize } from '../config/database';