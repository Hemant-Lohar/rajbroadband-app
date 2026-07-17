# Raj Broadband — project context for Claude Code

This file onboards Claude Code. Read it before making changes.

## What this is

An installable (PWA) staff app for a broadband/cable operator in the
Peth/Manikwadi area, Maharashtra. Staff look up customers (English/Marathi),
manage subscriptions, and track recharges and pending payments. Built for the
owner (a Java backend developer) to run the family business.

**Stack:** React 18 + Vite 7 + Tailwind 3 + Supabase (Postgres + Auth). PWA via
vite-plugin-pwa. Deployed to Cloudflare Pages (currently drag-and-drop of the
`dist` folder; moving to Git-connected).

## Working style the owner expects

- **Ask before building.** Confirm the plan, THEN write code. Do not start
  editing on the first mention of a problem.
- **Be honest about tradeoffs and limitations.** Flag security/data issues.
  Don't ship fake fixes or claim something works without checking.
- **Test logic against real data** before building UI (there are 149 real
  customers). Verify builds compile.
- Prefer being asked over being surprised.

## Architecture

```
src/
  config.js            brand, staff email, cache TTL
  lib/supabase.js      client (reads VITE_SUPABASE_URL / _ANON_KEY from .env)
  lib/auth.js          signIn/signOut, useSession, useOnline
  lib/db.js            CRUD, soft delete, offline cache, plans, recharges
  lib/search.js        bilingual + phone search
  lib/translit.js      Marathi auto-fill dictionary (learned from own data)
  lib/google-translit.js  Google Input Tools fallback (best-effort, silent fail)
  lib/subscription.js  status logic (derived), expiry math
  lib/validate.js      form rules
  components/          UI (see below)
  App.jsx              wires everything
public/brand/          logo mark + full lockup
```

Key components: Header, SearchBar, ResultsList (+StatusDot), CustomerDetail
(shared by desktop panel + mobile CustomerSheet), CustomerForm, PlanBlock,
RechargeSheet, HistorySheet, Tabs (bottom bar mobile / segmented desktop),
ExpiringView, PendingView, TrashPanel, ConfirmDialog, Toast, ErrorBoundary,
UpdatePrompt, Login, icons.jsx.

## Data model (Supabase)

- **customers**: id, name, marathi_name, username, contact, deleted_at (soft
  delete), plan_id, expiry_date, last_recharge_date, last_amount, manual_status
  ('suspended' | null). Match key across imports is **username** (names dup).
- **plans**: 20 seeded. name, speed_mbps, duration_days, unlimited, active,
  sort_order. Names have NO `_UL` suffix even where unlimited internally.
- **recharges**: full history. customer_id, plan_id, plan_name, recharge_date,
  expiry_date, amount, payment_status ('paid'|'pending'), paid_date, note.

RLS: authenticated-only, on all tables. Project created after May 2026 so it
needs explicit Postgres GRANTs (see migrations). Anon key is safe client-side.

## Business rules (decided with owner — do not change without asking)

- **Expiry = recharge_date + plan_duration**, counted from the day of payment.
  A late renewal loses the gap days. (e.g. expires 5th, recharge 8th → new
  expiry = 8th + duration.)
- **Status is derived, never stored**: suspended (manual override) > expired
  (expiry past) > expiring (≤3 days) > active > none (no plan).
- **Price is per-recharge, not per-plan** (same plan, different price per
  customer). Amount pre-fills from the customer's last recharge, editable.
- **Payment defaults to PENDING** (credit is the norm). Mark paid later.
- **Double-recharge**: if customer is already active, warn + confirm (don't
  hard-block — upgrades/early renewals/corrections must stay possible).
- 2 prepaid customers (manikandan_panshop1, samratraj_bar) have no plan.

## UI/design language

- Orange (#ff7f15, brand-500) is the **accent only** — primary actions, active
  states. NOT the wallpaper. Overusing it was a real complaint.
- Neutrals do the quiet work: warm paper bg (surface #f6f3ee), white cards,
  near-black ink text. Avatar + Call button use `slate` (#3a3f4b), not black.
- Status colors keep their own identity (green/amber/red/slate/grey).
- Mobile: bottom tab bar (Search/Expiring/Pending), WhatsApp-style pill behind
  active icon. Desktop: split view + segmented control with sliding pill.
- Inputs must be 16px on mobile (`text-base sm:text-[15px]`) or iOS zooms.
  This lives on the input CLASS, not a base `input {}` rule (class wins).
- Respect safe-area insets for anything bottom-anchored (FAB, tab bar, sheets).
- date/select inputs need width:100% + min-width:0 or iOS overflows them.

## Commands

```bash
npm install
npm run dev        # local, http://localhost:5173
npm run build      # → dist/ (bakes .env keys in at build time)
```

## .env (never commit — gitignored)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

For testing against a throwaway DB, the owner keeps a second project's keys and
comment-swaps them in .env (restart dev server after changing). NEVER build for
production with test keys active.

## Migrations (run once each, in Supabase SQL Editor, in order)

1. supabase-setup.sql — base tables
2. supabase-migration-2.sql — GRANTs fix + soft delete
3. supabase-migration-3-phase1.sql — plans, recharges, subscription columns,
   seeds 20 plans, backfills 149 customers

## Deploy

Cloudflare Pages. Currently: `npm run build` then drag `dist`. Env vars are
baked into the build (drag-and-drop has no Cloudflare-side env vars). If moving
to Git-connected Pages, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the
Cloudflare dashboard instead.

## Still open / future

- Phase 2 (not started): revenue reports (collected vs billed), filters by
  plan/status, analytics.
- Confirm Google Input Tools transliteration works in-browser (CORS untested;
  falls back silently to dictionary-only if blocked).
- Security: confirm public signup is OFF in Supabase; strong shared password.
