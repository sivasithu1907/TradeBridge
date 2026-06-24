import { query } from '../db/pool.js';

/**
 * requireAuth — blocks any request without a valid session.
 * This is the server-side replacement for the prototype's complete
 * absence of authentication. req.session.user is only ever set by
 * the login/register routes after a real password check.
 */
export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = req.session.user;
  next();
}

/**
 * requireRole(...roles) — blocks requests from authenticated users
 * whose role isn't in the allowed list. Must run after requireAuth.
 *
 * This is enforced here, on the server, not in the browser — closing
 * the prototype's "open devtools and call switchRole('admin')" hole.
 * A client can claim whatever it wants; only the session set during
 * a real login is trusted.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

/**
 * requireOwnCompanyOrAdmin — for routes that take a :companyId param,
 * ensures a non-admin user can only act on their own company's data.
 * This is the actual mechanism behind "marketplace isolation between
 * companies" — not a design intention, an enforced check on every request.
 */
export function requireOwnCompanyOrAdmin(companyIdParam = 'companyId') {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    const targetCompanyId = req.params[companyIdParam] ?? req.body?.[companyIdParam];
    if (targetCompanyId && targetCompanyId !== req.user.companyId) {
      return res.status(403).json({ error: 'You do not have access to this company\'s data' });
    }
    next();
  };
}

/**
 * requireVerifiedForwarder — forwarder-only actions (submitting quotes)
 * require the company to have passed admin verification first. This is
 * the real enforcement behind "Approve Forwarders" in the admin flow —
 * in the prototype, verification was cosmetic and didn't gate anything.
 *
 * Checks the database directly rather than trusting req.user's session
 * snapshot: verification status can change (admin approves/suspends)
 * after a session was issued, and a session that's days old shouldn't
 * be able to act on stale permissions — or be wrongly blocked by them.
 */
export async function requireVerifiedForwarder(req, res, next) {
  if (req.user.role !== 'forwarder') {
    return res.status(403).json({ error: 'Only forwarder accounts can perform this action' });
  }
  try {
    const result = await query('SELECT verification_status FROM companies WHERE id = $1', [req.user.companyId]);
    const status = result.rows[0]?.verification_status;
    if (status !== 'verified') {
      return res.status(403).json({
        error: 'Your company is pending verification. You can browse RFQs but cannot submit quotes until an admin approves your account.',
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}
