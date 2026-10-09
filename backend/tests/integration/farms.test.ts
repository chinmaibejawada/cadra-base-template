import request from 'supertest';
import app from '../../src/app';
import { Farm } from '../../src/models';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

beforeAll(setupTestDatabase);
afterAll(teardownTestDatabase);

describe('Farms API', () => {
  beforeEach(async () => {
    await Farm.destroy({ where: {}, force: true });
  });

  describe('POST /api/farms', () => {
    it('should create a farm', async () => {
      const res = await request(app)
        .post('/api/farms')
        .send({ name: 'Test Farm', city: 'Springfield', state: 'IL' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Farm');
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject farm without name', async () => {
      const res = await request(app)
        .post('/api/farms')
        .send({ city: 'Springfield' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/farms', () => {
    it('should return empty list when no farms exist', async () => {
      const res = await request(app).get('/api/farms');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return all active farms', async () => {
      await Farm.create({ name: 'Farm A' });
      await Farm.create({ name: 'Farm B' });

      const res = await request(app).get('/api/farms');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /api/farms/:id', () => {
    it('should return farm by id', async () => {
      const farm = await Farm.create({ name: 'Test Farm' });
      const res = await request(app).get(`/api/farms/${farm.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Farm');
    });

    it('should return 404 for non-existent farm', async () => {
      const res = await request(app).get('/api/farms/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/farms/:id', () => {
    it('should update a farm', async () => {
      const farm = await Farm.create({ name: 'Old Name' });
      const res = await request(app)
        .put(`/api/farms/${farm.id}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
    });
  });

  describe('DELETE /api/farms/:id', () => {
    it('should soft-delete a farm', async () => {
      const farm = await Farm.create({ name: 'To Delete' });
      const res = await request(app).delete(`/api/farms/${farm.id}`);
      expect(res.status).toBe(204);

      const deleted = await Farm.findByPk(farm.id);
      expect(deleted?.isActive).toBe(false);
    });
  });
});