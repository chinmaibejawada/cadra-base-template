import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/database';
import '../models';

async function reset(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('All tables dropped and recreated.');

    const { seed } = await import('../seeders/seed');
    await seed();

    console.log('Reset complete — database re-migrated and re-seeded.');
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

reset();
