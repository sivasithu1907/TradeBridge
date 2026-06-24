import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { validateBody, createRfqSchema } from '../middleware/validate.js';

export const rfqRouter = Router();

rfqRouter.use(requireAuth);

/**
 * Create an RFQ. Importer-only. Server generates the RFQ number and
 * stamps importer_company_id from the session — never from the request
 * body, so an importer can never create an RFQ on behalf of another
 * company by tampering with the payload.
 */
rfqRouter.post('/', requireRole('importer'), validateBody(createRfqSchema), async (req, res, next) => {
  try {
    const d = req.validated;
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO rfqs (
         rfq_number, importer_company_id, created_by_user_id,
         origin, origin_code, destination, dest_code, incoterms, freight_type,
         container_type, commodity, weight_kg, volume_cbm, cargo_ready_date,
         expiry_date, remarks
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        rfqNumber, req.user.companyId, req.user.id,
        d.origin, d.originCode, d.destination, d.destCode, d.incoterms, d.freightType,
        d.containerType, d.commodity, d.weightKg, d.volumeCbm ?? null, d.cargoReadyDate,
        d.expiryDate, d.remarks ?? null,
      ]
    );

    res.status(201).json({ rfq: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * List RFQs. What you see depends on who you are — this is the actual
 * marketplace-isolation logic, not just a UI filter:
 *   - importer: only their own company's RFQs
 *   - forwarder: only 'active' RFQs (the open feed)
 *   - admin: everything
 */
rfqRouter.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'importer') {
      result = await query(
        `SELECT * FROM rfqs WHERE importer_company_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
        [req.user.companyId]
      );
    } else if (req.user.role === 'forwarder') {
      result = await query(
        `SELECT r.* FROM rfqs r
         WHERE r.status = 'active' AND r.deleted_at IS NULL
         ORDER BY r.created_at DESC`
      );
    } else {
      result = await query(`SELECT * FROM rfqs WHERE deleted_at IS NULL ORDER BY created_at DESC`);
    }
    res.json({ rfqs: result.rows });
  } catch (err) {
    next(err);
  }
});

rfqRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM rfqs WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]);
    const rfq = result.rows[0];
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    // Importers can only view their own RFQs in detail; forwarders can
    // view any active one (that's the point of the open marketplace feed).
    if (req.user.role === 'importer' && rfq.importer_company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'You do not have access to this RFQ' });
    }

    res.json({ rfq });
  } catch (err) {
    next(err);
  }
});
