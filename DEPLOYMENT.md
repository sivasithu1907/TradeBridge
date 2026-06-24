# Deploying TheDreamV Marketplace to Hetzner

This walks through everything from "no server exists" to "the app is
live and reachable at your server's IP address." No domain required for
this pass -- we'll note exactly what changes later when you get one.

Total time: roughly 30-45 minutes if nothing goes wrong, longer if it's
your first time with any of these tools. That's normal -- go slowly
through Part 1 especially, since a mistake there (leaving the server
open, weak passwords) is the kind that actually matters.

---

## Part 0 -- What you'll end up with

- A small Ubuntu server on Hetzner Cloud (CPX22: 2 AMD vCPU, 4GB RAM,
  80GB SSD), locked down so only SSH (22) and this app's port (8080)
  can reach it from outside.
- Docker running three containers: Postgres (database), the backend API,
  and nginx (serving the frontend + proxying API calls).
- The whole stack reachable at `http://<your-server-ip>:8080`. Port
  8080 (rather than the default 80) is deliberate, so this can run on
  the same Hetzner account as another project without a port conflict --
  if this ends up being the only thing on this particular server, port
  80 would work just as well, but 8080 costs nothing to keep.
- No TLS/HTTPS yet -- that requires a real domain name, which Let's
  Encrypt (the free certificate provider) needs in order to verify you
  own it. Plain HTTP is fine for initial testing with people you trust;
  don't put real customer payment details through it.

---

## Part 1 -- Create the Hetzner server

1. Go to https://console.hetzner.cloud and sign in (or create an account
   if you haven't).
2. Create a new **Project** (e.g. "TheDreamV Marketplace").
3. Inside the project, click **Add Server**:
   - **Location**: pick whichever is closest to your actual users (e.g.
     Singapore is usually the lowest latency option if most traffic is
     from Sri Lanka/South Asia).
   - **Image**: Ubuntu 24.04.
   - **Type**: **CPX22** (2 AMD vCPU, 4GB RAM, 80GB SSD) is enough for
     testing this stack comfortably. You can resize later without
     rebuilding.
   - **Volume**: skip for now -- not needed yet.
   - **Networking**: leave default (public IPv4 + IPv6).
   - **SSH Key**: this is the important one. Click "Add SSH Key" and
     paste your **public** key (not private). If you don't have one yet:
     ```bash
     # Run this on your own laptop, not the server
     ssh-keygen -t ed25519 -C "your-email@example.com"
     # Press enter through the prompts (a passphrase is optional but recommended)
     cat ~/.ssh/id_ed25519.pub
     ```
     Paste the output of that last command into Hetzner's SSH key field.
     Using a key instead of a password is genuinely important -- password
     SSH login gets brute-forced within hours on a public IP.
   - **Name**: e.g. `tdv-marketplace-prod`.
4. Click **Create & Buy now**. Within about a minute, you'll see the
   server's public IP address on its detail page. **Copy that IP** --
   you'll need it constantly from here on. We'll call it `<SERVER_IP>`
   for the rest of this doc.

---

## Part 2 -- First login and basic hardening

From your own laptop:

```bash
ssh root@<SERVER_IP>
```

You should land in a fresh root shell. Now lock things down before doing
anything else:

```bash
# Update the system
apt-get update && apt-get upgrade -y

# Create a non-root user to do everything else as (good practice --
# never operate day-to-day as root)
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the new user so you can log in as them too
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Set up the firewall: only allow SSH and this app's port
apt-get install -y ufw
ufw allow OpenSSH
ufw allow 8080/tcp
ufw --force enable
ufw status
```

You should see `Status: active` and the two rules listed (OpenSSH and
8080). From now on, log in as `deploy`, not `root`:

```bash
ssh deploy@<SERVER_IP>
```

(Optional but recommended once you've confirmed the `deploy` login
works: disable root SSH login entirely by editing
`/etc/ssh/sshd_config`, setting `PermitRootLogin no`, then
`systemctl restart sshd`. Do this from a *second* terminal so you don't
lock yourself out if something goes wrong.)

---

## Part 3 -- Install Docker

Still as `deploy` (use `sudo` where needed):

```bash
# Hetzner's Ubuntu 24.04 image doesn't ship Docker -- install it via
# Docker's official convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Let your user run docker without sudo every time
sudo usermod -aG docker deploy

# Log out and back in for the group change to take effect
exit
```

```bash
ssh deploy@<SERVER_IP>
docker --version
docker compose version
```

Both commands should print version numbers. If `docker compose version`
fails, your Docker install may be older -- the convenience script
installs the modern `docker compose` plugin by default, so this
shouldn't happen, but if it does, run
`sudo apt-get install -y docker-compose-plugin`.

---

## Part 4 -- Get the code onto the server

You have the project as a zip. The simplest path for a first deploy:

**Option A -- upload directly** (simplest, no Git needed):

From your own laptop, in the folder containing the unzipped
`tdv-marketplace` folder:

```bash
scp -r tdv-marketplace deploy@<SERVER_IP>:~/
```

This copies the whole project over SSH. It'll take a few seconds.

**Option B -- push to a Git repo first, then clone on the server**
(better long-term, since future updates become `git pull` instead of
re-uploading everything). If you want this, set up a GitHub/GitLab repo,
push the project there, then on the server:

```bash
git clone <your-repo-url> tdv-marketplace
```

Either way, you should end up with `~/tdv-marketplace/` on the server,
containing `backend/`, `frontend/`, and `docker-compose.yml`.

---

## Part 5 -- Configure environment variables

```bash
cd ~/tdv-marketplace
cp .env.example .env
nano .env   # or vim, whichever you're comfortable with
```

Fill in real values:

```bash
# Generate two random secrets -- run these and paste the output in:
openssl rand -hex 32   # use this for POSTGRES_PASSWORD
openssl rand -hex 32   # use this for SESSION_SECRET
```

Your `.env` should end up looking like:

```
POSTGRES_PASSWORD=<the first random string>
SESSION_SECRET=<the second random string>
CORS_ORIGINS=http://<SERVER_IP>:8080
```

Replace `<SERVER_IP>` with your actual server's IP address (the same one
you've been SSHing to). This project runs on port 8080 on this server,
not 80 -- that's deliberate, so it can sit alongside another project on
the same Hetzner account without a port conflict.

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

**Do not commit this `.env` file to Git** if you went with Option B
above -- it contains real secrets. The `.gitignore` already in the repo
excludes it, but double-check.

---

## Part 6 -- Build and start everything

```bash
cd ~/tdv-marketplace
docker compose up -d --build
```

This will take a few minutes the first time (downloading base images,
installing dependencies, building the frontend). `-d` runs it in the
background. Watch progress with:

```bash
docker compose logs -f
```

(`Ctrl+C` to stop watching logs -- this does not stop the containers.)

Once it settles, check everything's running:

```bash
docker compose ps
```

You should see three services: `postgres`, `backend`, `frontend`, all
`Up` (postgres should also say `healthy` once its healthcheck passes).

---

## Part 7 -- Apply the database schema

The containers are running, but the database is empty -- no tables yet.
Run the migration once, against the running backend container:

```bash
docker compose exec backend node src/db/migrate.js
```

You should see:
```
Applying schema.sql ...
Schema applied successfully.
```

If you see a connection error instead, double-check `POSTGRES_PASSWORD`
in `.env` matches what `docker-compose.yml` is using (it should, since
both pull from the same `.env` file) and that `docker compose ps` shows
postgres as `healthy`.

---

## Part 8 -- Create your first admin account

Admins can't self-register through the UI (deliberately -- see the
schema comments on why). Use the seed script to create one -- this was
tested directly (not just written) during development: it creates the
account with a real bcrypt hash and is safe to re-run (it detects an
existing account with the same email and makes no changes rather than
erroring or duplicating):

```bash
docker compose exec backend sh -c "ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='YourChosenPassword123!' ADMIN_NAME='Your Name' node src/db/seed.js"
```

Replace the email, password, and name with your real ones. You should see:
```
Admin account created: you@example.com (id: ...)
```

---

## Part 9 -- Verify it's actually live

From your own laptop's browser, go to:

```
http://<SERVER_IP>:8080
```

You should see the landing page. Try:
- Registering an importer account
- Registering a forwarder account (it'll say pending verification)
- Logging in as the admin you just created, approving that forwarder
- Creating an RFQ as the importer, submitting a quote as the forwarder,
  accepting it, checking the shipment tracking page

This is the same flow that was tested extensively during development --
if any step fails here, it's almost certainly an environment/config
issue (wrong `.env` value, container not running) rather than an
application bug, since the logic itself was verified working earlier.

---

## Day-to-day operations

**View logs** (e.g. while debugging):
```bash
docker compose logs -f backend     # just the backend
docker compose logs -f             # everything
```

**Restart after pulling new code:**
```bash
cd ~/tdv-marketplace
git pull                            # if using Option B
docker compose up -d --build        # rebuilds only what changed
```

**Back up the database** (do this regularly once there's real data):
```bash
docker compose exec postgres pg_dump -U tdv_app tdv_marketplace > backup_$(date +%Y%m%d).sql
```
Copy that file off the server periodically (e.g. `scp` it to your
laptop or upload to cloud storage) -- a backup that only exists on the
same server it's backing up doesn't protect you if that server dies.

**Stop everything:**
```bash
docker compose down          # stops containers, keeps data
docker compose down -v       # stops AND deletes all data -- be careful
```

---

## What changes once you get a domain

1. Point the domain's DNS A record at `<SERVER_IP>`.
2. Update `.env`: change `CORS_ORIGINS` from `http://<SERVER_IP>:8080`
   to `https://your-domain.com`.
3. Open port 443: `sudo ufw allow 443/tcp`.
4. Add a reverse-proxy layer with automatic TLS. The simplest option is
   swapping nginx for **Caddy**, which gets you free, auto-renewing
   HTTPS certificates with almost no config -- at that point you'd also
   typically move back to standard port 80/443 instead of 8080, since a
   real domain doesn't need a non-standard port the way a bare IP
   shared with another project does. Ask for this step when you're
   ready and the updated compose file and Caddyfile can be written.

---

## Troubleshooting

**`docker compose up` fails immediately** -- usually a syntax error in
`.env` (e.g. a stray quote). Re-check it against `.env.example`.

**Site loads but API calls fail (network errors in browser console)** --
check `docker compose logs backend` for the actual error. Common cause:
`DATABASE_URL` mismatch, or the migration (Part 7) was never run.

**"Connection refused" from your browser entirely** -- check
`ufw status` shows port 8080 allowed, and `docker compose ps` shows the
`frontend` container `Up` with port `8080->80` mapped.

**Forgot the admin password** -- repeat Part 8 with a new password;
it'll just be a second admin row, which is fine.
