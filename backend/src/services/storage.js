import { mkdir, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Local-disk storage backend for v1 testing on a single Hetzner box.
 *
 * Deliberately written behind this small interface (save/getStream/delete)
 * so that when this moves past testing onto real traffic, swapping in an
 * S3-compatible backend (e.g. Hetzner Object Storage, or AWS S3) means
 * rewriting this one file — nothing in routes/ or services/documents.js
 * needs to change, since they only ever call storage.save() etc.
 */
export const storage = {
  async init() {
    await mkdir(UPLOAD_DIR, { recursive: true });
  },

  /**
   * Saves a buffer to disk under a generated key and returns that key.
   * The key (not the original filename) is what gets stored in
   * documents.storage_key — never trust the client-supplied filename
   * as a path component.
   */
  async save(buffer, originalFilename) {
    const ext = extname(originalFilename).toLowerCase();
    const key = `${randomUUID()}${ext}`;
    const fullPath = join(UPLOAD_DIR, key);
    const { writeFile } = await import('fs/promises');
    await writeFile(fullPath, buffer);
    return key;
  },

  getStream(key) {
    return createReadStream(join(UPLOAD_DIR, key));
  },

  async delete(key) {
    try {
      await unlink(join(UPLOAD_DIR, key));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  },
};

// Allowed document MIME types — rejects anything else before it ever
// touches disk. The prototype accepted "filenames" as strings with zero
// validation; this is the real-world equivalent of that check.
export const ALLOWED_DOC_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
