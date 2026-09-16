# Deploying to the VPS

Target: `server1.eldava.com` / **162.0.239.195**, AlmaLinux 9, 1 GB RAM, 20 GB disk.
Stack: Node 20 · PM2 · Nginx (reverse proxy + TLS via Let's Encrypt) · Supabase Postgres (already set up).

The plan deploys to **`app.eldava.com`** first, so the live `eldava.com`
(currently on 198.54.120.135) is untouched until you choose to switch it.

Everything you need is in `deploy/`:

| File | What it does |
| --- | --- |
| `setup-server.sh` | one-time server prep (Node, Nginx, Certbot, PM2, swap, firewall, SELinux, app user) |
| `deploy.sh` | deploy / redeploy: pull, install, Prisma generate, build, PM2 reload |
| `nginx.conf` + `eldava-proxy-headers.inc` | the Nginx site |
| `ecosystem.config.js` | the PM2 process |

---

## 0. Before you start (5 minutes, on your PC)

**a. DNS.** In your DNS provider, add an **A record**: `app` → `162.0.239.195`.
(Later, to go live on the main domain, change the A records for `@` and `www` to
the same IP and run Certbot again for those names.)

**b. Put the code in git.** The project has no git history - which is how the
previous version of this backend was lost. This also becomes how you deploy.

```powershell
cd "D:\web development\health-website"
git init
git add .
git commit -m "Eldava Health: site + backend"
```

Create a **private** repository on GitHub, then:

```powershell
git remote add origin https://github.com/<you>/eldava-health.git
git branch -M main
git push -u origin main
```

`.env`, `.env.local`, `node_modules` and `.next` are gitignored - secrets never
go to GitHub. You will create the env files on the server by hand in step 3.

**c. SSH in.** From PowerShell (the VPS panel gives you the root password):

```powershell
ssh root@162.0.239.195
```

---

## 1. Prepare the server (once, ~5 minutes)

On the server, as root:

```bash
dnf -y install git
git clone https://github.com/<you>/eldava-health.git /tmp/eldava-src
bash /tmp/eldava-src/deploy/setup-server.sh app.eldava.com
```

For a private repo, GitHub will ask for a username and a **personal access
token** (Settings → Developer settings → Fine-grained tokens, read-only on
this repo) - not your account password.

The script installs everything, creates a **2 GB swap file** (without it
`next build` runs out of memory on 1 GB), opens ports 80/443, and tells SELinux
to let Nginx talk to the app. It ends with a checklist.

## 2. Put the code in place

```bash
sudo -iu eldava
git clone https://github.com/<you>/eldava-health.git /var/www/eldava
exit
```

(As root, `rm -rf /tmp/eldava-src` afterwards - it was only needed for the setup script.)

## 3. Environment files (on the server)

Still as root, create the two files. The **database URL goes in `.env`**; the
Prisma CLI only reads that file.

```bash
cat > /var/www/eldava/.env <<'EOF'
DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"   # Supabase -> Connect -> Session pooler; URL-encode the password
EOF

cat > /var/www/eldava/.env.local <<'EOF'
NEXT_PUBLIC_SITE_URL="https://app.eldava.com"     # every email link + the og:image URL in link previews; baked in at build, so set it BEFORE deploy.sh
ANTHROPIC_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
# Email via the Namecheap Private Email mailbox (SMTP)
SMTP_HOST="mail.privateemail.com"
SMTP_PORT="465"
SMTP_USER="telehealth@eldava.com"
SMTP_PASS=""
MAIL_FROM="Eldava Health <telehealth@eldava.com>"
ADMIN_EMAIL="telehealth@eldava.com"
EOF

chown eldava:eldava /var/www/eldava/.env /var/www/eldava/.env.local
chmod 600 /var/www/eldava/.env /var/www/eldava/.env.local
```

Leave the optional keys empty to start: intake, payments and email run in their
labelled mock modes, exactly as on your PC. Fill them in when you have them and
run `deploy.sh` again.

## 4. Build and start

```bash
sudo -iu eldava bash /var/www/eldava/deploy/deploy.sh
```

This takes a few minutes the first time (the build leans on swap). At the end
`pm2 status` should show `eldava` **online**. Check it answers locally:

```bash
curl -sI http://127.0.0.1:3000/ | head -1        # HTTP/1.1 200 OK
```

Then from your PC, before TLS: `http://app.eldava.com/` should load the site.

## 5. HTTPS (once DNS resolves)

As root:

```bash
certbot --nginx -d app.eldava.com --redirect -m you@example.com --agree-tos
```

Certbot edits the Nginx config, installs the certificate and sets up
auto-renewal. `https://app.eldava.com/` is now live, and http redirects to it.

## 6. Taking real payments - card and Klarna

Right now the server has **no Stripe key**, so every checkout (card *and*
"Pay later" / Klarna) goes to the built-in `/mock-checkout` page and no money
moves. Nothing else is needed for Klarna to *appear* - it is simulated. To
take real money:

1. **Stripe account** - <https://dashboard.stripe.com>. Register the
   business (UK entity, GBP). Until Stripe's activation is complete the account
   is in test mode only.
2. **Enable Klarna on the account** - Dashboard → *Settings → Payments →
   Payment methods* → find **Klarna** → *Turn on*. Klarna needs a UK/EU
   business and GBP/EUR; Stripe shows any blocker on that page. Without this
   step Stripe rejects every Klarna session with *"payment method type klarna
   is invalid"* and the patient sees *"Pay later with Klarna is not available
   at the moment"*.
3. **Keys** - Dashboard → *Developers → API keys*. Put the secret key in
   `/var/www/eldava/.env.local` as `STRIPE_SECRET_KEY="sk_test_…"` (test) or
   `"sk_live_…"` (live). Never the publishable `pk_` key - the site uses
   Stripe's hosted page, so it has no use for it.
4. **Webhook** (below) - without it payments are taken but never marked paid.
5. `deploy.sh`, then open **Admin → Dashboard → System status**. It checks
   the key against Stripe, whether Klarna is actually switched on for the
   account, and whether the webhook secret is present - and lists the last
   few checkout failures with Stripe's exact error text.

Test cards and Klarna test flows: <https://docs.stripe.com/testing> (card
`4242 4242 4242 4242`; Klarna in test mode lets you approve or decline on a
sandbox page).

### Webhook

Stripe dashboard → Developers → Webhooks → **Add endpoint**:

- URL: `https://app.eldava.com/api/payments/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `checkout.session.expired`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then
`deploy.sh` again. The app's own routing already ensures `/api/*` never
308-redirects, which Stripe would treat as a failed delivery.

---

## Day-to-day

**Redeploy after a change:** commit and push on your PC, then on the server
`sudo -iu eldava bash /var/www/eldava/deploy/deploy.sh`.

**Logs:** `sudo -iu eldava pm2 logs eldava` · **restart:** `pm2 restart eldava`
· **Nginx:** `journalctl -u nginx -e` · **memory:** `free -h`.

**Going live on the main domain:** point `eldava.com` and `www.eldava.com` at
162.0.239.195, then

```bash
sed -i 's/server_name app.eldava.com;/server_name eldava.com www.eldava.com app.eldava.com;/' /etc/nginx/conf.d/eldava.conf
nginx -t && systemctl reload nginx
certbot --nginx -d eldava.com -d www.eldava.com -d app.eldava.com --redirect
```

and set `NEXT_PUBLIC_SITE_URL="https://eldava.com"` in `.env.local` + redeploy.

## Things to know about this box

- **1 GB RAM.** The running app uses ~200 MB; the *build* is what needs swap.
  `deploy.sh` caps Node at 1.5 GB heap and PM2 restarts the app if it ever
  passes 600 MB. Do not run two builds at once.
- **Prisma is built on the server on purpose.** The query engine is
  platform-specific (`rhel-openssl-3.0.x` here). Never copy `node_modules`
  from Windows.
- **The demo clinicians** (`eldava-demo-2026`) are in the shared Supabase
  database and will be live on this URL too. Delete or re-password them before
  sharing the link with anyone: `prisma/seed.js` lists them. Easiest from the
  admin panel: *Clinicians -> open one -> Deactivate* (or set a new password).
- **The admin panel** is at `https://app.eldava.com/admin/`. The seeded login is
  `admin@eldava.com` / `eldava-admin-2026` - it is in a public git repo, so
  **change it before anyone else has the link**. Either run the seed once with
  your own values (`SEED_ADMIN_EMAIL=you@eldava.com SEED_ADMIN_PASSWORD='...'
  npm run db:seed` creates a second admin; the seed never resets an existing
  one), or change the seeded password directly:

  ```bash
  cd /var/www/eldava && node -e "
  const {PrismaClient}=require('@prisma/client');const {scryptSync,randomBytes}=require('crypto');
  const pw=process.argv[1];const salt=randomBytes(16);
  const hash=['scrypt',16384,salt.toString('hex'),scryptSync(pw,salt,64,{N:16384}).toString('hex')].join('$');
  new PrismaClient().admin.update({where:{email:'admin@eldava.com'},data:{passwordHash:hash}}).then(()=>console.log('changed'))
  " 'YOUR-NEW-PASSWORD'
  ```

  Then *Sign out* in the panel and back in. New doctors who apply on the site
  now wait in *Doctor applications* until you approve them there.
- **Backups.** Supabase keeps daily backups on paid plans; on the free tier,
  export periodically. The VPS holds no data - it can be rebuilt from git in
  ten minutes with this guide.
