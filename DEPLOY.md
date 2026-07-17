# Deploying Raj Broadband

Recommended host: **Cloudflare Pages** — free, unlimited bandwidth, allows
commercial use, and gives you Cloudflare Access (a second lock) for free.

> ⚠️ **Do not use Vercel's free Hobby plan.** Its terms prohibit commercial
> use, and a business staff tool counts. Vercel enforces this and disables
> accounts. Netlify and Render free tiers are fine alternatives if you prefer.

---

## 1 · Before you deploy — three things only you can do

### ☐ Turn OFF public signup — **the important one**

Supabase → **Authentication** → **Sign In / Providers** →
**Allow new users to sign up** → **OFF**

Any signed-in user can read all 149 customers. If strangers can register their
own account, they can read your data. This single setting is the difference
between a private tool and a public one.

### ☐ Set a strong shared password

Supabase → **Authentication** → **Users** → your account → reset password.

It's the only thing between the internet and your customer list. Don't leave it
as anything guessable.

### ☐ Never expose the `service_role` key

Only `VITE_SUPABASE_ANON_KEY` belongs in the app. The `anon` key is safe in a
browser — Row Level Security does the real protecting. The `service_role` key
bypasses all of it.

---

## 2 · Deploy to Cloudflare Pages

1. Push this project to a Git repo.
   `.env` is gitignored, so your keys don't go with it — that's intended.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   connect your repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. **Add environment variables** (Settings → Environment variables). Copy the
   values from your local `.env`:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://uebfoeemvfsjbtlprust.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci…` (the long anon key) |

   > **Skip this and the app builds fine but can't reach the database.**
   > It's the most common deploy mistake.

5. **Save and Deploy.**

You'll get an HTTPS URL. Open it on a phone → Chrome menu → *Install app*
(or Safari → Share → *Add to Home Screen*).

---

## 3 · Optional but recommended: Cloudflare Access

This puts a gate **in front of the whole site**. Strangers who find your URL
see nothing — not even the login page. Free for up to 50 users.

1. Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** →
   **Add an application** → **Self-hosted**
2. Point it at your Pages domain.
3. Policy → **Allow** → **Emails** → list your staff's email addresses.
4. Save.

Staff now get a one-time code by email the first time, then the normal app
login. Two independent locks instead of one.

---

## 4 · Keep the Supabase project awake

**Free Supabase projects pause after 7 days with no requests.** The data
survives, but the app stops working until you manually restore it from the
dashboard — and only you can do that.

If staff use the app most days, you'll never hit this. If a quiet week is
plausible (holidays, festivals), set up a free pinger:

### UptimeRobot (5 minutes, no card)

1. Sign up at **uptimerobot.com**
2. **Add New Monitor**
   - **Type:** HTTP(s)
   - **Friendly name:** Raj Broadband
   - **URL:** your deployed Pages URL
   - **Interval:** 12 hours (or whatever the free plan allows)
3. Save.

That's it — the project never sits idle for 7 days, so it never pauses.

**Alternatives if you'd rather not:** just open the app yourself every few days,
or accept the risk and resume the project from the dashboard if it ever pauses
(takes a minute).

---

## 5 · Shipping an update later

Push to your repo → Cloudflare rebuilds automatically.

Staff with the app installed will see a **"A new version is ready — Reload"**
banner rather than being stuck on the old cached version.

---

## What's already handled

- ✅ **Search engines blocked** — `robots.txt` + `noindex` tags, so your internal
  tool won't turn up in Google
- ✅ **No source maps** in the production build
- ✅ **Crash recovery** — a component error shows a "Reload" screen, not a blank
  white page
- ✅ **`npm audit` clean** — 0 vulnerabilities
- ✅ **HTTPS** — enforced by Cloudflare

---

## Things worth knowing

**No database backups on the Supabase free tier.** Soft delete protects you from
user mistakes, not from anything at the database level.

**Shared account = no audit trail.** You can't tell who added or deleted a
customer, and when someone leaves you change the password for everyone. That was
a deliberate tradeoff — moving to individual logins later is a small change.

**Your usage is tiny.** ~1 MB of a 500 MB database, ~75 MB of 5 GB monthly
bandwidth. You will not hit those limits.
