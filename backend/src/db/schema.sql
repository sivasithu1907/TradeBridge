-- ============================================================================
-- TheDreamV Freight Marketplace — PostgreSQL Schema
-- ============================================================================
-- Design notes:
--   - UUIDs as primary keys (safe for distributed IDs, don't leak row counts)
--   - Every mutable table has created_at + updated_at, maintained by trigger
--   - Soft-delete (deleted_at) instead of hard delete on user-facing entities,
--     so accidental deletes are recoverable and audit history stays intact
--   - Enums via CHECK constraints (not Postgres ENUM type) so adding a new
--     status later is an ALTER TABLE ... DROP/ADD CONSTRAINT, not a migration
--     that locks the type system
--   - company_id is the multi-tenant boundary: every RFQ/Quotation/Booking
--     is scoped to a company, and a user's access is mediated through their
--     company_id + role. This is what "marketplace isolation between
--     companies" actually means at the schema level.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";   -- for case-insensitive email column

-- ----------------------------------------------------------------------------
-- Trigger helper: auto-maintain updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- COMPANIES
-- One row per organization — an importer business or a forwarder business.
-- Admins are not companies; they're platform staff (see users.role).
-- ----------------------------------------------------------------------------
CREATE TABLE companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_type        TEXT NOT NULL CHECK (company_type IN ('importer', 'forwarder')),
  name                TEXT NOT NULL,
  registration_number TEXT,                -- business registration / BRN
  country             TEXT NOT NULL,
  address             TEXT,
  website             TEXT,

  -- Forwarder-specific (NULL for importers)
  verification_status TEXT NOT NULL DEFAULT 'pending'
                       CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  verified_at          TIMESTAMPTZ,
  verified_by          UUID,               -- admin user id, FK added after users table exists
  subscription_tier    TEXT NOT NULL DEFAULT 'free'
                        CHECK (subscription_tier IN ('free', 'professional', 'enterprise')),
  rating_avg            NUMERIC(3,2) DEFAULT NULL CHECK (rating_avg BETWEEN 0 AND 5),
  rating_count           INTEGER NOT NULL DEFAULT 0,
  completed_shipments    INTEGER NOT NULL DEFAULT 0,
  avg_response_time_hrs  NUMERIC(6,2),

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

CREATE INDEX idx_companies_type_status ON companies (company_type, verification_status) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- USERS
-- A person. Belongs to at most one company (importer staff or forwarder
-- staff), OR is platform staff (role = 'admin', company_id NULL).
-- Password handling: store only the bcrypt hash, never the plaintext.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('importer', 'forwarder', 'admin')),
  full_name         TEXT NOT NULL,
  email             CITEXT NOT NULL UNIQUE,   -- case-insensitive uniqueness
  password_hash     TEXT NOT NULL,
  phone             TEXT,
  avatar_url        TEXT,

  email_verified_at TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,   -- admin kill-switch, distinct from soft-delete

  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,

  -- An admin has no company; importer/forwarder staff must have one
  CONSTRAINT chk_company_required CHECK (
    (role = 'admin' AND company_id IS NULL) OR
    (role IN ('importer', 'forwarder') AND company_id IS NOT NULL)
  )
);

CREATE INDEX idx_users_company ON users (company_id) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE companies ADD CONSTRAINT fk_companies_verified_by
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- SESSIONS
-- Server-side session store (backs express-session via connect-pg-simple,
-- OR used directly if we issue our own opaque tokens). Real auth state,
-- unlike the prototype's client-side role flag.
-- ----------------------------------------------------------------------------
CREATE TABLE sessions (
  sid       TEXT PRIMARY KEY,
  sess      JSONB NOT NULL,
  expire    TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_expire ON sessions (expire);

-- ----------------------------------------------------------------------------
-- RFQS (Request for Quotation)
-- Created by an importer company, broadcast to the forwarder marketplace.
-- ----------------------------------------------------------------------------
CREATE TABLE rfqs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number          TEXT NOT NULL UNIQUE,        -- e.g. RFQ-2026-0001, generated server-side
  importer_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by_user_id  UUID NOT NULL REFERENCES users(id),

  origin              TEXT NOT NULL,
  origin_code         TEXT NOT NULL,
  destination          TEXT NOT NULL,
  dest_code            TEXT NOT NULL,
  incoterms            TEXT NOT NULL CHECK (incoterms IN ('FOB','EXW','CIF','DDP','FCA','CPT')),
  freight_type          TEXT NOT NULL CHECK (freight_type IN ('Ocean FCL','Ocean LCL','Air Freight')),
  container_type         TEXT NOT NULL,
  commodity              TEXT NOT NULL,
  weight_kg               NUMERIC(10,2) NOT NULL CHECK (weight_kg > 0),
  volume_cbm               NUMERIC(10,2) CHECK (volume_cbm > 0),
  cargo_ready_date          DATE NOT NULL,
  expiry_date                DATE NOT NULL CHECK (expiry_date > cargo_ready_date),
  remarks                    TEXT,

  status                     TEXT NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'quoted', 'awarded', 'expired', 'cancelled')),
  responses_count             INTEGER NOT NULL DEFAULT 0,
  best_offer_usd               NUMERIC(12,2),

  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at                    TIMESTAMPTZ
);

CREATE INDEX idx_rfqs_importer ON rfqs (importer_company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rfqs_status_created ON rfqs (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_rfqs_expiry ON rfqs (expiry_date) WHERE status = 'active';
CREATE TRIGGER trg_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- QUOTATIONS
-- Submitted by a forwarder company against a specific RFQ.
-- ----------------------------------------------------------------------------
CREATE TABLE quotations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number          TEXT NOT NULL UNIQUE,
  rfq_id                UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  forwarder_company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  submitted_by_user_id  UUID NOT NULL REFERENCES users(id),

  price_usd             NUMERIC(12,2) NOT NULL CHECK (price_usd > 0),
  transit_time_days     INTEGER NOT NULL CHECK (transit_time_days > 0),
  validity_date         DATE NOT NULL,
  response_time_hrs     NUMERIC(6,2) NOT NULL DEFAULT 0,
  notes                 TEXT,

  status                TEXT NOT NULL DEFAULT 'submitted'
                         CHECK (status IN ('submitted', 'accepted', 'rejected', 'withdrawn', 'expired')),
  performance_score     SMALLINT CHECK (performance_score BETWEEN 0 AND 100),

  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A forwarder can submit only one *active* quote per RFQ; revisions
  -- should create a new row referencing the old one (see quotation_revisions
  -- note below) rather than overwriting history.
  UNIQUE (rfq_id, forwarder_company_id, submitted_at)
);

CREATE INDEX idx_quotations_rfq ON quotations (rfq_id);
CREATE INDEX idx_quotations_forwarder ON quotations (forwarder_company_id);
CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- BOOKINGS
-- Created the moment an importer accepts a quotation. 1:1 with the accepted
-- quotation; 1:1 with the shipment that tracks its physical progress.
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number        TEXT NOT NULL UNIQUE,
  rfq_id                UUID NOT NULL REFERENCES rfqs(id),
  quotation_id          UUID NOT NULL REFERENCES quotations(id),
  importer_company_id   UUID NOT NULL REFERENCES companies(id),
  forwarder_company_id  UUID NOT NULL REFERENCES companies(id),

  freight_amount_usd    NUMERIC(12,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'confirmed'
                         CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_importer ON bookings (importer_company_id);
CREATE INDEX idx_bookings_forwarder ON bookings (forwarder_company_id);
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- SHIPMENTS
-- Physical tracking of a booking. vessel/voyage/container fields are
-- ocean-specific; for air freight these may be NULL — kept nullable rather
-- than forcing a polymorphic shipment_details table for v1.
-- ----------------------------------------------------------------------------
CREATE TABLE shipments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,

  current_status      TEXT NOT NULL DEFAULT 'booking_confirmed',
  progress_pct         SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  eta                  DATE,

  vessel_name           TEXT,
  voyage_number          TEXT,
  container_number        TEXT,

  origin_lat               NUMERIC(9,6),
  origin_lng               NUMERIC(9,6),
  dest_lat                 NUMERIC(9,6),
  dest_lng                 NUMERIC(9,6),
  current_lat               NUMERIC(9,6),
  current_lng               NUMERIC(9,6),

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- SHIPMENT MILESTONES
-- Ordered checkpoints for a shipment (gate-in, loaded, customs, etc).
-- A real table instead of a JSON array, so admin/forwarder tooling can
-- query "all shipments stuck at milestone X" across the whole marketplace.
-- ----------------------------------------------------------------------------
CREATE TABLE shipment_milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id   UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  sequence_no   SMALLINT NOT NULL,
  title         TEXT NOT NULL,
  location      TEXT,
  completed     BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  is_current    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (shipment_id, sequence_no)
);

CREATE INDEX idx_milestones_shipment ON shipment_milestones (shipment_id, sequence_no);

-- ----------------------------------------------------------------------------
-- DOCUMENTS
-- Real file references (see backend storage layer) attached to an RFQ,
-- booking, or shipment. owner_company_id is the access-control anchor.
-- ----------------------------------------------------------------------------
CREATE TABLE documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),

  rfq_id              UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  booking_id          UUID REFERENCES bookings(id) ON DELETE CASCADE,
  shipment_id         UUID REFERENCES shipments(id) ON DELETE CASCADE,

  doc_type            TEXT NOT NULL CHECK (doc_type IN (
                         'commercial_invoice', 'packing_list', 'bill_of_lading',
                         'certificate_of_origin', 'insurance', 'customs_form', 'other'
                       )),
  file_name           TEXT NOT NULL,
  storage_key         TEXT NOT NULL,    -- path/key in storage backend (local disk path or S3 key)
  mime_type           TEXT NOT NULL,
  file_size_bytes     BIGINT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending_review'
                       CHECK (status IN ('pending_review', 'verified', 'rejected')),

  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- a document must be attached to at least one of rfq/booking/shipment
  CONSTRAINT chk_document_attached CHECK (
    rfq_id IS NOT NULL OR booking_id IS NOT NULL OR shipment_id IS NOT NULL
  )
);

CREATE INDEX idx_documents_owner ON documents (owner_company_id);
CREATE INDEX idx_documents_rfq ON documents (rfq_id) WHERE rfq_id IS NOT NULL;
CREATE INDEX idx_documents_booking ON documents (booking_id) WHERE booking_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- MESSAGES
-- Direct messaging tied to a booking (the natural conversation anchor
-- between one importer company and one forwarder company).
-- ----------------------------------------------------------------------------
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_user_id  UUID NOT NULL REFERENCES users(id),
  body            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_booking ON messages (booking_id, created_at);

-- ----------------------------------------------------------------------------
-- RATINGS
-- Left by importer on forwarder after shipment completion. Feeds
-- companies.rating_avg / rating_count (updated via trigger or app logic).
-- ----------------------------------------------------------------------------
CREATE TABLE ratings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rated_company_id      UUID NOT NULL REFERENCES companies(id),  -- the forwarder being rated
  rated_by_user_id      UUID NOT NULL REFERENCES users(id),
  score                 SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ratings_company ON ratings (rated_company_id);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('rfq', 'quote', 'booking', 'shipment', 'message', 'system')),
  title       TEXT NOT NULL,
  description TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- Tracks a forwarder company's plan over time. Billing integration (Stripe)
-- is intentionally out of scope for now — admin can set/change tier
-- manually via the companies.subscription_tier field + an entry here for
-- history. Designed so a `stripe_subscription_id` column can be added
-- later without restructuring.
-- ----------------------------------------------------------------------------
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tier            TEXT NOT NULL CHECK (tier IN ('free', 'professional', 'enterprise')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  -- Future Stripe seam:
  -- stripe_customer_id TEXT,
  -- stripe_subscription_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_company ON subscriptions (company_id, status);

-- ----------------------------------------------------------------------------
-- AUDIT LOG
-- Append-only record of sensitive actions (admin approvals, role changes,
-- quote acceptance). Never updated or deleted by application code.
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action        TEXT NOT NULL,           -- e.g. 'company.verify', 'quote.accept'
  entity_type   TEXT NOT NULL,           -- e.g. 'company', 'rfq', 'quotation'
  entity_id     UUID,
  metadata      JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs (actor_user_id, created_at DESC);
