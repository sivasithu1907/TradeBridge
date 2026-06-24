import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireVerifiedForwarder } from '../middleware/rbac.js';
import { validateBody, submitQuoteSchema } from '../middleware/validate.js';

export const quotationRouter = Router();

quotationRouter.use(requireAuth);

/**
 * Submit a quotation against an RFQ. Forwarder must be verified
 * (enforced server-side via requireVerifiedForwarder) — this is the real
 * teeth behind admin's "Approve Forwarders" step, which in the prototype
 * was a cosmetic badge that didn't actually gate anything.
 */
quotationRouter.post('/', requireVerifiedForwarder, validateBody(submitQuoteSchema), async (req, res, next) => {
  try {
    const d = req.validated;

    const rfqResult = await query(`SELECT * FROM rfqs WHERE id = $1 AND deleted_at IS NULL`, [d.rfqId]);
    const rfq = rfqResult.rows[0];
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status !== 'active' && rfq.status !== 'quoted') {
      return res.status(409).json({ error: `This RFQ is no longer accepting quotes (status: ${rfq.status})` });
    }
    if (new Date(rfq.expiry_date) < new Date()) {
      return res.status(409).json({ error: 'This RFQ has expired' });
    }

    // One active quote per forwarder per RFQ — prevents a forwarder from
    // spamming multiple competing quotes against the same request.
    const existing = await query(
      `SELECT id FROM quotations WHERE rfq_id = $1 AND forwarder_company_id = $2 AND status = 'submitted'`,
      [d.rfqId, req.user.companyId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an active quote on this RFQ. Withdraw it first to submit a new one.' });
    }

    const quoteNumber = `QTE-F-${Math.floor(100 + Math.random() * 900)}`;
    // performance_score reflects response speed as a simple, transparent
    // heuristic for v1 — fast, simple, swappable for a richer model later
    // once there's real on-time-delivery and rating data to weight in.
    const score = Math.min(99, Math.max(50, Math.round(88 - (d.responseTimeHrs ?? 0))));

    const result = await query(
      `INSERT INTO quotations (
         quote_number, rfq_id, forwarder_company_id, submitted_by_user_id,
         price_usd, transit_time_days, validity_date, notes, performance_score
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [quoteNumber, d.rfqId, req.user.companyId, req.user.id, d.priceUsd, d.transitTimeDays, d.validityDate, d.notes ?? null, score]
    );

    await query(
      `UPDATE rfqs SET
         status = 'quoted',
         responses_count = responses_count + 1,
         best_offer_usd = LEAST(COALESCE(best_offer_usd, $2), $2)
       WHERE id = $1`,
      [d.rfqId, d.priceUsd]
    );

    await query(
      `INSERT INTO notifications (user_id, type, title, description)
       SELECT created_by_user_id, 'quote', 'New Quotation Received',
              'A new quote of $' || $2::text || ' was submitted for ' || rfq_number
       FROM rfqs WHERE id = $1`,
      [d.rfqId, d.priceUsd]
    );

    res.status(201).json({ quotation: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

quotationRouter.get('/rfq/:rfqId', async (req, res, next) => {
  try {
    const rfqResult = await query(`SELECT * FROM rfqs WHERE id = $1`, [req.params.rfqId]);
    const rfq = rfqResult.rows[0];
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    if (req.user.role === 'importer' && rfq.importer_company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'You do not have access to these quotations' });
    }

    let result;
    if (req.user.role === 'forwarder') {
      // A forwarder only ever sees their own quote against this RFQ,
      // never competitors' pricing — that's a basic marketplace-integrity
      // rule, not just a nice-to-have.
      result = await query(
        `SELECT * FROM quotations WHERE rfq_id = $1 AND forwarder_company_id = $2 ORDER BY submitted_at DESC`,
        [req.params.rfqId, req.user.companyId]
      );
    } else {
      result = await query(
        `SELECT q.*, c.name AS forwarder_name, c.rating_avg, c.verified_at IS NOT NULL AS forwarder_verified
         FROM quotations q
         JOIN companies c ON c.id = q.forwarder_company_id
         WHERE q.rfq_id = $1 ORDER BY q.price_usd ASC`,
        [req.params.rfqId]
      );
    }
    res.json({ quotations: result.rows });
  } catch (err) {
    next(err);
  }
});

quotationRouter.post('/:id/withdraw', requireVerifiedForwarder, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE quotations SET status = 'withdrawn'
       WHERE id = $1 AND forwarder_company_id = $2 AND status = 'submitted'
       RETURNING *`,
      [req.params.id, req.user.companyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found or cannot be withdrawn' });
    }
    res.json({ quotation: result.rows[0] });
  } catch (err) {
    next(err);
  }
});
