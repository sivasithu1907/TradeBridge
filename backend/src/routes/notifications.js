import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/rbac.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    next(err);
  }
});

notificationRouter.post('/mark-read', async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [req.user.id]);
    res.json({ message: 'Marked all as read' });
  } catch (err) {
    next(err);
  }
});
