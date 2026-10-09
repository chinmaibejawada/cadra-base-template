import { sequelize } from '../src/config/database';

export async function setupTestDatabase(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = process.env.DB_NAME || 'prairie_ridge_ag_test';
  await sequelize.sync({ force: true });
}

export async function teardownTestDatabase(): Promise<void> {
  await sequelize.drop();
  await sequelize.close();
}