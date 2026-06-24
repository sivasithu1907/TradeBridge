import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';

export const shipmentRouter = Router();

shipmentRouter.use(requireAuth);

shipmentRouter.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'importer') {
      result = await query(
        `SELECT s.*, b.booking_number FROM shipments s
         JOIN bookings b ON b.id = s.booking_id
         WHERE b.importer_company_id = $1 ORDER BY s.created_at DESC`,
        [req.user.companyId]
      );
    } else if (req.user.role === 'forwarder') {
      result = await query(
        `SELECT s.*, b.booking_number FROM shipments s
         JOIN bookings b ON b.id = s.booking_id
         WHERE b.forwarder_company_id = $1 ORDER BY s.created_at DESC`,
        [req.user.companyId]
      );
    } else {
      result = await query(`SELECT s.*, b.booking_number FROM shipments s JOIN bookings b ON b.id = s.booking_id ORDER BY s.created_at DESC`);
    }
    res.json({ shipments: result.rows });
  } catch (err) {
    next(err);
  }
});

shipmentRouter.get('/:id', async (req, res, next) => {
  try {
    const shipResult = await query(
      `SELECT s.*, b.booking_number, b.importer_company_id, b.forwarder_company_id
       FROM shipments s JOIN bookings b ON b.id = s.booking_id WHERE s.id = $1`,
      [req.params.id]
    );
    const shipment = shipResult.rows[0];
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const isOwner = req.user.role === 'admin' ||
      shipment.importer_company_id === req.user.companyId ||
      shipment.forwarder_company_id === req.user.companyId;
    if (!isOwner) return res.status(403).json({ error: 'You do not have access to this shipment' });

    const milestones = await query(
      `SELECT * FROM shipment_milestones WHERE shipment_id = $1 ORDER BY sequence_no ASC`,
      [req.params.id]
    );

    res.json({ shipment, milestones: milestones.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * Forwarder updates shipment progress — the real version of "Update
 * Milestones" from the forwarder flow. Only the forwarder on this
 * specific booking can update it, never any other forwarder.
 */
shipmentRouter.patch('/:id/milestone/:milestoneId', requireRole('forwarder'), async (req, res, next) => {
  try {
    const { completed } = req.body;
    const ownerCheck = await query(
      `SELECT b.forwarder_company_id FROM shipments s
       JOIN bookings b ON b.id = s.booking_id WHERE s.id = $1`,
      [req.params.id]
    );
    if (ownerCheck.rows[0]?.forwarder_company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'You do not manage this shipment' });
    }

    await query(
      `UPDATE shipment_milestones SET completed = $1, completed_at = CASE WHEN $1 THEN now() ELSE NULL END
       WHERE id = $2 AND shipment_id = $3`,
      [!!completed, req.params.milestoneId, req.params.id]
    );

    const milestones = await query(
      `SELECT * FROM shipment_milestones WHERE shipment_id = $1 ORDER BY sequence_no ASC`,
      [req.params.id]
    );
    const completedCount = milestones.rows.filter((m) => m.completed).length;
    const progressPct = Math.round((completedCount / milestones.rows.length) * 100);

    await query(`UPDATE shipments SET progress_pct = $1 WHERE id = $2`, [progressPct, req.params.id]);

    res.json({ milestones: milestones.rows, progressPct });
  } catch (err) {
    next(err);
  }
});
