import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { pool } from './db/pool.js';
import { storage } from './services/storage.js';

import { authRouter } from './routes/auth.js';
import { rfqRouter } from './routes/rfqs.js';
import { quotationRouter } from './routes/quotations.js';
import { bookingRouter } from './routes/bookings.js';
import { shipmentRouter } from './routes/shipments.js';
import { documentRouter } from './routes/documents.js';
import { adminRouter } from './routes/admin.js';
import { notificationRouter } from './routes/notifications.js';
import { messageRouter } from './routes/messages.js';

const app = express();
const PgSessionStore = pgSession(session);
const isProd = process.env.NODE_ENV === 'production';

// --- Security baseline ---
// Fixes the audit's "no security headers / no CSRF posture / no rate
// limiting" findings, which weren't applicable to the prototype because
// it had no server to apply them to.
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true, // required so session cookies travel with requests
  })
);
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// General API rate limit — separate, tighter limiting on /auth/login is
// defined locally in routes/auth.js since brute-force login attempts
// deserve a stricter ceiling than browsing the RFQ feed.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Sessions (real server-side auth state, backed by Postgres) ---
app.use(
  session({
    store: new PgSessionStore({ pool, tableName: 'sessions' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // requires HTTPS in production — set up via the Caddy/Nginx reverse proxy
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// --- Routes ---
app.use('/api/auth', authRouter);
app.use('/api/rfqs', rfqRouter);
app.use('/api/quotations', quotationRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/shipments', shipmentRouter);
app.use('/api/documents', documentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/messages', messageRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- 404 + error handling ---
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  // Never leak internal error details (stack traces, SQL) to the client
  // in production — generic message only once NODE_ENV=production.
  const message = isProd && status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await storage.init();
  app.listen(PORT, () => {
    console.log(`TheDreamV Marketplace API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start();
