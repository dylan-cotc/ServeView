import pool from '../db';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // List of migrations in order (starting from 011 since earlier ones are already run)
    const migrations = [
      '011_add_primary_location_constraint.sql',
      '012_create_users_table.sql',
    ];

    // Run each migration in order
    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, '../migrations', migration);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await pool.query(migrationSql);
      console.log(`✓ ${migration} completed`);
    }

    // Read and execute the seed data
    const seedPath = path.join(__dirname, '../migrations/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    await pool.query(seedSql);
    console.log('✓ Seed data inserted successfully');

    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
