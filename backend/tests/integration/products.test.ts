import request from 'supertest';
import app from '../../src/app';
import { Product } from '../../src/models';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

beforeAll(setupTestDatabase);
afterAll(teardownTestDatabase);

describe('Products API', () => {
  beforeEach(async () => {
    await Product.destroy({ where: {}, force: true });
  });

  describe('POST /api/products', () => {
    it('should create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          sku: 'PR-TEST-001',
          name: 'Test Product',
          unit: 'lbs',
          unitPrice: 10.99,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBe('PR-TEST-001');
    });

    it('should reject duplicate SKU', async () => {
      await Product.create({ sku: 'PR-TEST-001', name: 'Existing', unit: 'lbs', unitPrice: 5.0 });
      const res = await request(app)
        .post('/api/products')
        .send({ sku: 'PR-TEST-001', name: 'Duplicate', unit: 'lbs', unitPrice: 5.0 });

      expect(res.status).toBe(409);
    });

    it('should reject product without required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Incomplete' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('should list all active products', async () => {
      await Product.bulkCreate([
        { sku: 'A', name: 'Product A', unit: 'lbs', unitPrice: 5.0 },
        { sku: 'B', name: 'Product B', unit: 'lbs', unitPrice: 10.0 },
      ]);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const product = await Product.create({ sku: 'PR-UPD', name: 'Original', unit: 'lbs', unitPrice: 5.0 });
      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .send({ name: 'Updated', unitPrice: 7.5 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated');
      expect(Number(res.body.data.unitPrice)).toBe(7.5);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft-delete a product', async () => {
      const product = await Product.create({ sku: 'PR-DEL', name: 'To Delete', unit: 'lbs', unitPrice: 5.0 });
      const res = await request(app).delete(`/api/products/${product.id}`);
      expect(res.status).toBe(204);

      const deleted = await Product.findByPk(product.id);
      expect(deleted?.isActive).toBe(false);
    });
  });
});