import request from 'supertest';
import app from '../../src/app';
import { Farm, Product, Order, OrderLine } from '../../src/models';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

beforeAll(setupTestDatabase);
afterAll(teardownTestDatabase);

describe('Orders API', () => {
  let farmId: number;
  let productId: number;

  beforeEach(async () => {
    await OrderLine.destroy({ where: {}, force: true });
    await Order.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    await Farm.destroy({ where: {}, force: true });

    const farm = await Farm.create({ name: 'Test Farm' });
    farmId = farm.id;

    const product = await Product.create({
      sku: 'PR-TEST',
      name: 'Test Product',
      unit: 'lbs',
      unitPrice: 10.00,
      currentStock: 100,
    });
    productId = product.id;
  });

  describe('POST /api/orders', () => {
    it('should create an order with lines', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          farmId,
          orderDate: '2026-04-01',
          lines: [{ productId, quantity: 10 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.orderNumber).toMatch(/^PR-2026-/);
      expect(res.body.data.orderLines).toHaveLength(1);
      expect(Number(res.body.data.subtotal)).toBe(100);
      expect(Number(res.body.data.totalAmount)).toBe(107);
    });

    it('should reject order without lines', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [] });

      expect(res.status).toBe(400);
    });

    it('should return existing order for duplicate idempotency key', async () => {
      const res1 = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 5 }], idempotencyKey: 'dup-key-1' });

      expect(res1.status).toBe(201);

      const res2 = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-02', lines: [{ productId, quantity: 99 }], idempotencyKey: 'dup-key-1' });

      expect(res2.status).toBe(201);
      expect(res2.body.data.id).toBe(res1.body.data.id);
      expect(Number(res2.body.data.orderLines[0].quantity)).toBe(5);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should transition from draft to pending', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      const res = await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'pending' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });

    it('should deduct inventory when transitioning to confirmed', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'pending' });

      const res = await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('confirmed');

      const product = await Product.findByPk(productId);
      expect(Number(product!.currentStock)).toBe(90);
    });

    it('should reject invalid transition', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      const res = await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'delivered' });

      expect(res.status).toBe(422);
    });

    it('should reject confirmation when insufficient stock', async () => {
      const product = await Product.findByPk(productId);
      await product!.update({ currentStock: 5 });

      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'pending' });

      const res = await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'confirmed' });

      expect(res.status).toBe(422);
    });

    it('should restore inventory on cancellation after confirmation', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      await request(app).patch(`/api/orders/${order.body.data.id}/status`).send({ status: 'pending' });
      await request(app).patch(`/api/orders/${order.body.data.id}/status`).send({ status: 'confirmed' });

      const res = await request(app)
        .patch(`/api/orders/${order.body.data.id}/status`)
        .send({ status: 'cancelled' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');

      const product = await Product.findByPk(productId);
      expect(Number(product!.currentStock)).toBe(100);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete a draft order', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      const res = await request(app).delete(`/api/orders/${order.body.data.id}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/orders/${order.body.data.id}`);
      expect(getRes.status).toBe(404);
    });

    it('should reject deleting a confirmed order', async () => {
      const order = await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 10 }] });

      await request(app).patch(`/api/orders/${order.body.data.id}/status`).send({ status: 'pending' });
      await request(app).patch(`/api/orders/${order.body.data.id}/status`).send({ status: 'confirmed' });

      const res = await request(app).delete(`/api/orders/${order.body.data.id}`);
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/orders', () => {
    it('should list orders', async () => {
      await request(app)
        .post('/api/orders')
        .send({ farmId, orderDate: '2026-04-01', lines: [{ productId, quantity: 5 }] });

      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });
  });
});