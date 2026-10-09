import dotenv from 'dotenv';
dotenv.config();

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/database';
import { Farm, Product, Order, OrderLine, Note } from '../models';
import type { OrderStatus } from '../models/Order';

const DATA_DIR = path.join(__dirname, '../../data');

interface SeedCounts {
  farms: number;
  products: number;
  orders: number;
  orderLines: number;
  notes: number;
}

function readCSV(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
}

function toDecimal(val: string | undefined): number {
  if (!val) return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

function toInt(val: string | undefined): number {
  if (!val) return 0;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function toBool(val: string | undefined): boolean {
  return val === '1' || val?.toLowerCase() === 'true';
}

function toDateOrNull(val: string | undefined): Date | null {
  if (!val || val.trim() === '' || val === 'NULL') return null;
  return new Date(val);
}

export async function seed(): Promise<SeedCounts> {
  const counts: SeedCounts = { farms: 0, products: 0, orders: 0, orderLines: 0, notes: 0 };

  try {
    await sequelize.authenticate();

    const farmRows = readCSV('farms.csv');
    for (const row of farmRows) {
      await Farm.create({
        name: row.name,
        address: row.address || null,
        city: row.city || null,
        state: row.state || null,
        zipCode: row.zip_code || null,
        phone: row.phone || null,
        email: row.email || null,
        isActive: toBool(row.is_active),
      });
      counts.farms++;
    }
    console.log(`Seeded ${counts.farms} farms.`);

    const productRows = readCSV('products.csv');
    for (const row of productRows) {
      await Product.create({
        sku: row.sku,
        name: row.name,
        description: row.description || null,
        category: row.category || null,
        unit: row.unit,
        unitPrice: toDecimal(row.unit_price),
        currentStock: toDecimal(row.current_stock),
        reorderPoint: toDecimal(row.reorder_point),
        isActive: toBool(row.is_active),
      });
      counts.products++;
    }
    console.log(`Seeded ${counts.products} products.`);

    const orderRows = readCSV('orders.csv');
    for (const row of orderRows) {
      await Order.create({
        orderNumber: row.order_number,
        farmId: toInt(row.farm_id),
        status: (row.status || 'draft') as OrderStatus,
        orderDate: new Date(row.order_date),
        requestedDeliveryDate: toDateOrNull(row.requested_delivery_date),
        actualDeliveryDate: toDateOrNull(row.actual_delivery_date),
        subtotal: toDecimal(row.subtotal),
        taxAmount: toDecimal(row.tax_amount),
        totalAmount: toDecimal(row.total_amount),
        notes: row.notes || null,
        idempotencyKey: row.idempotency_key || null,
      });
      counts.orders++;
    }
    console.log(`Seeded ${counts.orders} orders.`);

    const lineRows = readCSV('order_lines.csv');
    for (const row of lineRows) {
      await OrderLine.create({
        orderId: toInt(row.order_id),
        productId: toInt(row.product_id),
        quantity: toDecimal(row.quantity),
        unitPrice: toDecimal(row.unit_price),
        lineTotal: toDecimal(row.line_total),
      });
      counts.orderLines++;
    }
    console.log(`Seeded ${counts.orderLines} order lines.`);

    const noteRows = readCSV('notes.csv');
    for (const row of noteRows) {
      await Note.create({
        notableType: row.notable_type as 'order' | 'farm' | 'product',
        notableId: toInt(row.notable_id),
        content: row.content,
        author: row.author || null,
        isInternal: toBool(row.is_internal),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
      });
      counts.notes++;
    }
    console.log(`Seeded ${counts.notes} notes.`);

    console.log('\n--- Seed Summary ---');
    console.log(`Farms: ${counts.farms}`);
    console.log(`Products: ${counts.products}`);
    console.log(`Orders: ${counts.orders}`);
    console.log(`Order Lines: ${counts.orderLines}`);
    console.log(`Notes: ${counts.notes}`);
    console.log('--- Seed Complete ---\n');

    return counts;
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
