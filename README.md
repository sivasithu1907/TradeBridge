# TheDreamV Freight Marketplace

A B2B freight marketplace connecting importers and freight forwarders.

## What's in this repo

```
/frontend   React + TypeScript + Tailwind (Vite). The original UI/UX,
            now wired to the real backend instead of local browser state.
/backend    Express + PostgreSQL API. Real auth, RBAC, the RFQ -> quote
            -> booking -> shipment marketplace loop, file uploads.
```

## Status (as of this build)

Wired to the real backend and tested end-to-end:
- Registration & login (real sessions, bcrypt password hashing)
- RFQ creation and the marketplace feed
- Quotation submission (gated by admin verification for forwarders)
- Quote acceptance -> booking + shipment creation (atomic transaction)
- Shipment detail + milestone tracking

Not yet wired to the frontend (backend routes exist and were tested in
isolation, but the corresponding screens still need their api/ calls added):
- Document upload UI (DocumentsCenter.tsx)
- Messaging UI (MessagingCenter.tsx) -- no backend route yet either
- Admin forwarder verification UI (UserManagement.tsx, MarketplaceManagement.tsx)
- Notifications list UI (NotificationDrawer.tsx)
- Subscriptions/billing (intentionally stubbed -- no payment processor yet)

## Running locally

### 1. Database

```bash
# Install Postgres 16+ if you don't have it, then:
createdb tdv_marketplace
createuser tdv_app --pwprompt   # set a password, put it in backend/.env
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and SESSION_SECRET
npm install
npm run db:migrate     # applies src/db/schema.sql
npm run dev            # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:3000, proxies /api to the backend
```

Open http://localhost:3000 -- register a company, then check the database
directly to seed an admin user (admins aren't self-registerable; see
backend/src/db/schema.sql comments for why).

## Deploying to Hetzner

See `DEPLOYMENT.md` for the full production runbook: creating the
server, hardening it, installing Docker, and getting the stack running
and reachable at the server's IP address.
