import request from 'supertest';
import app from '../../src/app';
import { Farm, Note } from '../../src/models';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

beforeAll(setupTestDatabase);
afterAll(teardownTestDatabase);

describe('Notes API', () => {
  let farmId: number;

  beforeEach(async () => {
    await Note.destroy({ where: {}, force: true });
    await Farm.destroy({ where: {}, force: true });

    const farm = await Farm.create({ name: 'Test Farm' });
    farmId = farm.id;
  });

  describe('POST /api/notes', () => {
    it('should create a note for a farm', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({
          notableType: 'farm',
          notableId: farmId,
          content: 'Test note content',
          author: 'Tester',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Test note content');
      expect(res.body.data.notableType).toBe('farm');
    });

    it('should reject note without content', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ notableType: 'farm', notableId: farmId, content: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/notes', () => {
    it('should list notes for a target entity', async () => {
      await Note.create({ notableType: 'farm', notableId: farmId, content: 'Note 1' });
      await Note.create({ notableType: 'farm', notableId: farmId, content: 'Note 2' });

      const res = await request(app).get(`/api/notes?type=farm&id=${farmId}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should return empty array for entity with no notes', async () => {
      const res = await request(app).get(`/api/notes?type=farm&id=9999`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const note = await Note.create({ notableType: 'farm', notableId: farmId, content: 'To delete' });
      const res = await request(app).delete(`/api/notes/${note.id}`);
      expect(res.status).toBe(204);
    });
  });
});