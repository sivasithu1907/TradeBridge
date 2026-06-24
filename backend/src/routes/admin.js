import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { validateBody, verifyCompanySchema } from '../middleware/validate.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/companies', async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    if (type) { params.push(type); conditions.push(`company_type = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`verification_status = $${params.length}`); }

    const result = await query(
      `SELECT * FROM companies WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ companies: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * Approve/reject/suspend a forwarder company. This is the real version
 * of "Approve Forwarders" — it actually gates whether that company's
 * users can submit quotes (see requireVerifiedForwarder middleware),
 * unlike the prototype's verifyForwarder() which just flipped a
 * cosmetic badge with no functional effect.
 */
adminRouter.patch('/companies/:id/verify', validateBody(verifyCompanySchema), async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE companies SET verification_status = $1, verified_at = now(), verified_by = $2
       WHERE id = $3 RETURNING *`,
      [req.validated.status, req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });

    await query(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'company.verify', 'company', $2, $3)`,
      [req.user.id, req.params.id, JSON.stringify({ newStatus: req.validated.status })]
    );

    res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/stats', async (req, res, next) => {
  try {
    const [companies, rfqs, bookings, pendingForwarders] = await Promise.all([
      query(`SELECT company_type, count(*) FROM companies WHERE deleted_at IS NULL GROUP BY company_type`),
      query(`SELECT status, count(*) FROM rfqs WHERE deleted_at IS NULL GROUP BY status`),
      query(`SELECT status, count(*), coalesce(sum(freight_amount_usd),0) AS total_value FROM bookings GROUP BY status`),
      query(`SELECT count(*) FROM companies WHERE company_type = 'forwarder' AND verification_status = 'pending'`),
    ]);
    res.json({
      companiesByType: companies.rows,
      rfqsByStatus: rfqs.rows,
      bookingsByStatus: bookings.rows,
      pendingForwarderCount: Number(pendingForwarders.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});
