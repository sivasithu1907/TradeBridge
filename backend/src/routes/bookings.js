import { Router } from 'express';
import { query, withTransaction } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

/**
 * Accept a quotation -> create a booking + shipment + initial milestones.
 *
 * This entire sequence is wrapped in one database transaction. In the
 * prototype, acceptQuote() did this as four separate setState calls —
 * harmless in a single in-memory browser tab, but a real correctness bug
 * once this is a server handling concurrent requests: if step 3 failed
 * after step 1 succeeded, you'd end up with a quote marked "accepted"
 * but no booking behind it. Wrapping it in withTransaction means it's
 * all-or-nothing.
 */
bookingRouter.post('/accept-quote/:quotationId', requireRole('importer'), async (req, res, next) => {
  try {
    const result = await withTransaction(async (client) => {
      const quoteResult = await client.query(
        `SELECT q.*, r.importer_company_id, r.rfq_number
         FROM quotations q JOIN rfqs r ON r.id = q.rfq_id
         WHERE q.id = $1 FOR UPDATE`,
        [req.params.quotationId]
      );
      const quote = quoteResult.rows[0];
      if (!quote) throw Object.assign(new Error('Quotation not found'), { status: 404 });
      if (quote.importer_company_id !== req.user.companyId) {
        throw Object.assign(new Error('You do not have access to this quotation'), { status: 403 });
      }
      if (quote.status !== 'submitted') {
        throw Object.assign(new Error(`This quotation cannot be accepted (status: ${quote.status})`), { status: 409 });
      }

      await client.query(`UPDATE quotations SET status = 'accepted' WHERE id = $1`, [quote.id]);
      await client.query(
        `UPDATE quotations SET status = 'rejected' WHERE rfq_id = $1 AND id != $2 AND status = 'submitted'`,
        [quote.rfq_id, quote.id]
      );
      await client.query(`UPDATE rfqs SET status = 'awarded' WHERE id = $1`, [quote.rfq_id]);

      const bookingNumber = `BKG-DV-${Math.floor(10000 + Math.random() * 90000)}`;
      const bookingResult = await client.query(
        `INSERT INTO bookings (booking_number, rfq_id, quotation_id, importer_company_id, forwarder_company_id, freight_amount_usd)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [bookingNumber, quote.rfq_id, quote.id, quote.importer_company_id, quote.forwarder_company_id, quote.price_usd]
      );
      const booking = bookingResult.rows[0];

      const shipmentResult = await client.query(
        `INSERT INTO shipments (booking_id, current_status, progress_pct, eta)
         VALUES ($1, 'booking_confirmed', 10, $2) RETURNING *`,
        [booking.id, quote.validity_date]
      );
      const shipment = shipmentResult.rows[0];

      await client.query(
        `INSERT INTO shipment_milestones (shipment_id, sequence_no, title, location, completed, is_current)
         VALUES
           ($1, 1, 'Booking Confirmed', 'Origin', true, true),
           ($1, 2, 'Container Gate-In & Export Customs', 'Origin Port', false, false),
           ($1, 3, 'Loaded on Vessel', 'Origin Port', false, false),
           ($1, 4, 'Arrival at Destination Terminal', 'Destination', false, false)`,
        [shipment.id]
      );

      await client.query(
        `INSERT INTO notifications (user_id, type, title, description)
         SELECT submitted_by_user_id, 'booking', 'Booking Confirmed!',
                $2 || ' awarded for ' || $3
         FROM quotations WHERE id = $1`,
        [quote.id, bookingNumber, quote.rfq_number]
      );

      return { booking, shipment };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

bookingRouter.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'importer') {
      result = await query(`SELECT * FROM bookings WHERE importer_company_id = $1 ORDER BY created_at DESC`, [req.user.companyId]);
    } else if (req.user.role === 'forwarder') {
      result = await query(`SELECT * FROM bookings WHERE forwarder_company_id = $1 ORDER BY created_at DESC`, [req.user.companyId]);
    } else {
      result = await query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    }
    res.json({ bookings: result.rows });
  } catch (err) {
    next(err);
  }
});
