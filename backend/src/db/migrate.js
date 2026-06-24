// Minimal migration runner for v1. There's a single schema.sql file right
// now; once the schema needs to evolve post-launch, split changes into
// numbered files in this directory (001_add_x.sql, 002_add_y.sql) and
// extend this script to apply only the ones not yet recorded in
// schema_migrations. For now, with no production data yet, applying the
// whole schema fresh is the simplest correct thing to do.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  console.log('Applying schema.sql ...');
  await pool.query(sql);
  console.log('Schema applied successfully.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
