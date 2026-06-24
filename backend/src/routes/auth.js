import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerCompany, verifyCredentials, toSessionUser, AuthError } from '../services/auth.js';
import { validateBody, registerSchema, loginSchema } from '../middleware/validate.js';

export const authRouter = Router();

// Login is the highest-value target for credential stuffing / brute force.
// Limit it specifically and more tightly than general API traffic.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { company, user } = await registerCompany(req.validated);
    res.status(201).json({
      message:
        company.company_type === 'forwarder'
          ? 'Account created. Your company is pending verification by a platform admin before you can submit quotes.'
          : 'Account created successfully.',
      company,
      user,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    const user = await verifyCredentials(email, password);
    req.session.user = toSessionUser(user);
    res.json({ user: req.session.user });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

authRouter.get('/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// Centralized error mapping for AuthError so route handlers stay terse
authRouter.use((err, req, res, next) => {
  if (err instanceof AuthError) {
    return res.status(err.status).json({ error: err.message });
  }
  next(err);
});
