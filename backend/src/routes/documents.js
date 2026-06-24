import { Router } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/rbac.js';
import { storage, ALLOWED_DOC_MIME_TYPES } from '../services/storage.js';

export const documentRouter = Router();

documentRouter.use(requireAuth);

documentRouter.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await query(
        `SELECT d.*, b.booking_number FROM documents d
         LEFT JOIN bookings b ON b.id = d.booking_id
         ORDER BY d.uploaded_at DESC LIMIT 200`
      );
    } else {
      result = await query(
        `SELECT d.*, b.booking_number FROM documents d
         LEFT JOIN bookings b ON b.id = d.booking_id
         WHERE d.owner_company_id = $1 ORDER BY d.uploaded_at DESC`,
        [req.user.companyId]
      );
    }
    res.json({ documents: result.rows });
  } catch (err) {
    next(err);
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 15) * 1024 * 1024 },
  // NOTE: this fileFilter only sees the client-declared Content-Type,
  // which a malicious client can lie about. The real check — sniffing
  // actual file bytes — happens after upload, below. This filter is
  // just a cheap early rejection for the common case.
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_DOC_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
    cb(null, true);
  },
});

documentRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const { docType, rfqId, bookingId, shipmentId } = req.body;

    if (!rfqId && !bookingId && !shipmentId) {
      return res.status(400).json({ error: 'Document must be attached to an rfqId, bookingId, or shipmentId' });
    }

    // Real content verification: read the actual magic bytes rather than
    // trusting what the client claimed in its Content-Type header. This
    // closes a gap found during manual testing — a client can label any
    // file as application/pdf and the multer fileFilter alone won't catch
    // it. Plain-text files (some commercial invoices are submitted as
    // .txt/.csv) have no detectable magic bytes, so we fall back to the
    // declared type only for those — everything else must match.
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const isPlainText = req.file.mimetype === 'text/plain' || req.file.mimetype === 'text/csv';
    if (!isPlainText && (!detected || !ALLOWED_DOC_MIME_TYPES.has(detected.mime))) {
      return res.status(400).json({
        error: 'File content does not match an allowed document type. The file may be corrupted or mislabeled.',
      });
    }

    const storageKey = await storage.save(req.file.buffer, req.file.originalname);

    const result = await query(
      `INSERT INTO documents (
         owner_company_id, uploaded_by_user_id, rfq_id, booking_id, shipment_id,
         doc_type, file_name, storage_key, mime_type, file_size_bytes
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.user.companyId, req.user.id, rfqId || null, bookingId || null, shipmentId || null,
        docType || 'other', req.file.originalname, storageKey, detected?.mime || req.file.mimetype, req.file.size,
      ]
    );

    res.status(201).json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/:id/download', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM documents WHERE id = $1`, [req.params.id]);
    const doc = result.rows[0];
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Only the owning company or an admin can download — documents often
    // contain commercial invoices and other sensitive shipment data.
    if (req.user.role !== 'admin' && doc.owner_company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'You do not have access to this document' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
    res.setHeader('Content-Type', doc.mime_type);
    storage.getStream(doc.storage_key).pipe(res);
  } catch (err) {
    next(err);
  }
});

// Multer errors (file too large, disallowed type) -> clean 400 response
documentRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
