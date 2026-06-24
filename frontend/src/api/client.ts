/**
 * Centralized API client.
 *
 * The backend (Postgres + Express) uses snake_case columns and lowercase
 * status enums ('active', 'quoted', ...) because that's idiomatic SQL.
 * The existing frontend components (kept as-is, per the brief) expect
 * camelCase fields and capitalized status strings ('Active', 'Quoted', ...)
 * because that's what the original prototype's mockData.ts used.
 *
 * Rather than rewriting 26 components to match the database's naming,
 * all translation happens here, in one place. Components continue to
 * read rfq.rfqNumber / rfq.status === 'Active' exactly as before; this
 * file is the only thing that knows both shapes exist.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // sends the session cookie
    headers:
      options.body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status, body?.details);
  }
  return body as T;
}

export const apiClient = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  postForm: <T,>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
};

// ---------------------------------------------------------------------------
// snake_case -> camelCase object key conversion (shallow + nested objects,
// not into arrays of primitives) and status string capitalization.
// ---------------------------------------------------------------------------

function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function camelizeKeys<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(camelizeKeys) as any;
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), camelizeKeys(v)])
    ) as T;
  }
  return obj;
}

/** 'active' -> 'Active', 'in_progress' -> 'In Progress' */
export function capitalizeStatus(status: string | null | undefined): string {
  if (!status) return '';
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
