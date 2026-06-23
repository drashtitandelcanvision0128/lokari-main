import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    console.log('Running Prisma migrations...');
    await execAsync('node_modules/.bin/prisma migrate deploy');
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  }
}
