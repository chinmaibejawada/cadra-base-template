import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/database';
import '../models';

async function migrate(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('Migration complete — all models synced with alter: true.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
