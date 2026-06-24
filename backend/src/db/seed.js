// Creates the platform's first admin account. Admins are deliberately not
// self-registerable through the public /api/auth/register endpoint (see
// schema.sql's chk_company_required constraint and registerCompany() in
// services/auth.js) -- the only way to get an admin account is to seed one
// directly against the database, which is what this script does.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=ChangeMe123! ADMIN_NAME="Platform Admin" npm run db:seed
//
// Safe to re-run: if a user with ADMIN_EMAIL already exists, this exits
// without making changes rather than erroring or creating a duplicate.

import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const BCRYPT_ROUNDS = 12;

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'Platform Admin';

  if (!email || !password) {
    console.error(
      'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.\n' +
      'Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=ChangeMe123! npm run db:seed'
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log(`An account with email ${email} already exists. No changes made.`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (role, full_name, email, password_hash)
     VALUES ('admin', $1, $2, $3)
     RETURNING id, email`,
    [fullName, email, passwordHash]
  );

  console.log(`Admin account created: ${result.rows[0].email} (id: ${result.rows[0].id})`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
