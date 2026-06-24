import { z } from 'zod';

export const registerSchema = z.object({
  companyType: z.enum(['importer', 'forwarder']),
  companyName: z.string().trim().min(2).max(200),
  country: z.string().trim().min(2).max(100),
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createRfqSchema = z.object({
  origin: z.string().trim().min(2).max(200),
  originCode: z.string().trim().min(2).max(10),
  destination: z.string().trim().min(2).max(200),
  destCode: z.string().trim().min(2).max(10),
  incoterms: z.enum(['FOB', 'EXW', 'CIF', 'DDP', 'FCA', 'CPT']),
  freightType: z.enum(['Ocean FCL', 'Ocean LCL', 'Air Freight']),
  containerType: z.string().trim().min(2).max(50),
  commodity: z.string().trim().min(2).max(300),
  // .positive() catches the prototype's complete absence of numeric
  // bounds checking — negative weight/volume could previously be submitted
  weightKg: z.number().positive().max(500_000),
  volumeCbm: z.number().positive().max(10_000).optional(),
  cargoReadyDate: z.string().date(),
  expiryDate: z.string().date(),
  remarks: z.string().trim().max(2000).optional(),
}).refine((data) => new Date(data.expiryDate) > new Date(data.cargoReadyDate), {
  message: 'Expiry date must be after cargo ready date',
  path: ['expiryDate'],
});

export const submitQuoteSchema = z.object({
  rfqId: z.string().uuid(),
  priceUsd: z.number().positive().max(10_000_000),
  transitTimeDays: z.number().int().positive().max(365),
  validityDate: z.string().date(),
  notes: z.string().trim().max(2000).optional(),
});

export const verifyCompanySchema = z.object({
  status: z.enum(['verified', 'rejected', 'suspended']),
});

export const sendMessageSchema = z.object({
  bookingId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

/**
 * Express middleware factory: validates req.body against a zod schema.
 * On failure, returns 400 with field-level errors instead of letting
 * bad data reach the database (or, in the prototype's case, reach
 * nothing at all and just silently corrupt local state).
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    req.validated = result.data;
    next();
  };
}
