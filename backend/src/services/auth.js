import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../db/pool.js';

const BCRYPT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Register a new company + its first user (the "company admin" for that
 * importer/forwarder). Importer companies are usable immediately;
 * forwarder companies start in 'pending' verification status and can't
 * receive RFQs or submit quotes until platform admin approves them —
 * this is the real version of the prototype's cosmetic verifiedBadge flip.
 */
export async function registerCompany({ companyType, companyName, country, fullName, email, password }) {
  if (!['importer', 'forwarder'].includes(companyType)) {
    throw new AuthError('Invalid company type', 400);
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AuthError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return withTransaction(async (client) => {
    const companyResult = await client.query(
      `INSERT INTO companies (company_type, name, country, verification_status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, company_type, name, verification_status`,
      [
        companyType,
        companyName,
        country,
        // Importers can use the platform right away; forwarders need
        // admin verification before they're visible in the marketplace.
        companyType === 'importer' ? 'verified' : 'pending',
      ]
    );
    const company = companyResult.rows[0];

    const userResult = await client.query(
      `INSERT INTO users (company_id, role, full_name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, role, full_name, email`,
      [company.id, companyType, fullName, email, passwordHash]
    );

    return { company, user: userResult.rows[0] };
  });
}

/**
 * Verify email + password against the stored hash. Deliberately returns
 * a generic error for both "no such user" and "wrong password" so the
 * login endpoint can't be used to enumerate which emails are registered.
 */
export async function verifyCredentials(email, password) {
  const result = await query(
    `SELECT u.id, u.company_id, u.role, u.full_name, u.email, u.password_hash,
            u.is_active, u.deleted_at, c.verification_status, c.name AS company_name
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user || user.deleted_at) {
    throw new AuthError('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password');
  }

  if (!user.is_active) {
    throw new AuthError('This account has been deactivated. Contact support.', 403);
  }

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

  delete user.password_hash;
  return user;
}

/**
 * What gets stored in the session and attached to req.user on every
 * authenticated request. Kept small and non-sensitive.
 */
export function toSessionUser(user) {
  return {
    id: user.id,
    companyId: user.company_id,
    role: user.role,
    fullName: user.full_name,
    email: user.email,
    companyName: user.company_name ?? null,
    companyVerificationStatus: user.verification_status ?? null,
  };
}
