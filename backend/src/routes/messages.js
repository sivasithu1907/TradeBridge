import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/rbac.js';
import { validateBody, sendMessageSchema } from '../middleware/validate.js';

export const messageRouter = Router();

messageRouter.use(requireAuth);

/**
 * Messages are scoped to a booking, not an RFQ. This matches the real
 * business shape: once an importer accepts a quote, exactly one importer
 * company and one forwarder company are paired on that booking, and
 * that's the only conversation that makes sense to have. There's no
 * "negotiate with the whole open marketplace" concept -- a forwarder who
 * didn't win the booking has no channel to message that importer.
 */
async function getBookingIfAuthorized(bookingId, user) {
  const result = await query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
  const booking = result.rows[0];
  if (!booking) return null;
  if (user.role === 'admin') return booking;
  const isParty = booking.importer_company_id === user.companyId || booking.forwarder_company_id === user.companyId;
  return isParty ? booking : null;
}

/**
 * List booking "threads" the current user is party to, with last message
 * preview -- what a messaging inbox list view needs, without requiring
 * the frontend to N+1 query each booking individually.
 */
messageRouter.get('/threads', async (req, res, next) => {
  try {
    let bookingFilter = '';
    const params = [];
    if (req.user.role === 'importer') {
      bookingFilter = 'WHERE b.importer_company_id = $1';
      params.push(req.user.companyId);
    } else if (req.user.role === 'forwarder') {
      bookingFilter = 'WHERE b.forwarder_company_id = $1';
      params.push(req.user.companyId);
    }
    // admin sees all threads, no filter

    const result = await query(
      `SELECT b.id AS booking_id, b.booking_number,
              ic.name AS importer_name, fc.name AS forwarder_name,
              (SELECT body FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
              (SELECT count(*) FROM messages WHERE booking_id = b.id AND is_read = false AND sender_user_id != $${params.length + 1}) AS unread_count
       FROM bookings b
       JOIN companies ic ON ic.id = b.importer_company_id
       JOIN companies fc ON fc.id = b.forwarder_company_id
       ${bookingFilter}
       ORDER BY last_message_at DESC NULLS LAST`,
      [...params, req.user.id]
    );

    res.json({ threads: result.rows });
  } catch (err) {
    next(err);
  }
});

messageRouter.get('/booking/:bookingId', async (req, res, next) => {
  try {
    const booking = await getBookingIfAuthorized(req.params.bookingId, req.user);
    if (!booking) return res.status(403).json({ error: 'You do not have access to this conversation' });

    const result = await query(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON u.id = m.sender_user_id
       WHERE m.booking_id = $1 ORDER BY m.created_at ASC`,
      [req.params.bookingId]
    );

    // Mark messages from the other party as read now that this user opened the thread
    await query(
      `UPDATE messages SET is_read = true WHERE booking_id = $1 AND sender_user_id != $2 AND is_read = false`,
      [req.params.bookingId, req.user.id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    next(err);
  }
});

messageRouter.post('/', validateBody(sendMessageSchema), async (req, res, next) => {
  try {
    const { bookingId, body } = req.validated;
    const booking = await getBookingIfAuthorized(bookingId, req.user);
    if (!booking) return res.status(403).json({ error: 'You do not have access to this conversation' });

    const result = await query(
      `INSERT INTO messages (booking_id, sender_user_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [bookingId, req.user.id, body]
    );

    const recipientCompanyId =
      req.user.companyId === booking.importer_company_id ? booking.forwarder_company_id : booking.importer_company_id;
    await query(
      `INSERT INTO notifications (user_id, type, title, description)
       SELECT id, 'message', 'New Message', $2
       FROM users WHERE company_id = $1`,
      [recipientCompanyId, body.length > 80 ? body.slice(0, 80) + '...' : body]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    next(err);
  }
});
