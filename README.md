# Raj Broadband — customer directory

Staff app for looking up Raj Broadband customers. Search in **English or
Marathi**, by username, or by phone number. Copy details, call, or message on
WhatsApp. Add / edit / delete customers — changes sync to **every staff device**.

Installable on phones (PWA) and works offline for lookups.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

`.env` holds your Supabase URL and anon key.

**To deploy, see [DEPLOY.md](./DEPLOY.md).**

---

## Signing in

- **Email:** `admin@rajbroadband.local` — pre-filled, staff never type it
- **Password:** set in Supabase → Authentication → Users

**Changing the password** takes 30 seconds in the Supabase dashboard and needs
**no redeploy**. Same place lets you sign out every device at once — do this if
a staff phone is lost.

---

## What staff can do

| | |
|---|---|
| **Search** | English name, Marathi नाव, username, or phone |
| **Tap a result** | Copy username/number, Call, WhatsApp |
| **Add / Edit** | Marathi name auto-fills from the English one |
| **Delete** | Goes to **Recently deleted** — restorable |
| **Recently deleted** | Restore, Delete forever, or Restore/Delete all |

### Offline

Lookups keep working with no signal — the list is cached on each device.
**Editing is disabled offline** (the dot turns 🔴 red), because two people
editing offline would silently overwrite each other.

> A new device must be online **once** before offline mode works.

### Marathi auto-fill

Typing the English name fills the Marathi one, in two layers:

1. **Your own customers** — the app learns `patil → पाटील` from records you
   already have. Exact, instant, offline, and it **improves with every customer
   you add**.
2. **Google Input Tools** — only for words your data has never seen. Free, no
   API key. If it's ever unavailable, the app silently falls back to layer 1 and
   you type the missing word (Gboard's Marathi keyboard transliterates as you
   type).

**Your data always wins** — Google can never override a spelling you've
confirmed.

> ⚠️ Glance at the suggestion before saving. Names are genuinely ambiguous
> (कदम vs कडम), and a wrong Marathi spelling makes that customer unfindable in
> Marathi search. The app blocks saving a name with English letters left in it.

### Validation

All four fields are required. Contact must be exactly 10 digits. Two warnings
that **don't** block saving: a number not starting 6–9 (likely typo), and a
number already on another account (you have 32 legitimate shared family lines).

---

## Subscriptions (plans, recharges, expiry)

Each customer can be on one of 20 **plans**. Staff **recharge** a customer,
which records the payment and sets a new expiry date.

**Status** is derived automatically, never typed:

- 🟢 **Active** — plan valid
- 🟠 **Expiring soon** — 3 days or less remaining
- 🔴 **Expired** — past the expiry date
- ⚫ **Suspended** — manually paused (overrides the above)
- ⚪ **No plan** — not set up yet

A small status dot shows on each search result; the full phrase
("expires in 12 days") shows on the profile.

### Recharging

Tap **Recharge** on a profile → pick plan → date (defaults today) → the new
expiry is **auto-calculated** (recharge date + plan duration; a late renewal
counts from the day of payment) → amount (pre-filled from their last recharge)
→ **Paid / Pending** (defaults Pending, since credit is normal). Save.

Every recharge is logged. History opens from the line under the plan block.

### The three tabs

- **Search** — the customer directory (unchanged)
- **Expiring** — everyone ≤3 days from expiry (and already-expired), soonest
  first, with Call / WhatsApp buttons. The renewal call list.
- **Pending** — everyone who owes money, with the total outstanding and a
  **Mark as paid** button on each.

### Setup

Run **`supabase-migration-3-phase1.sql`** once in the SQL Editor. It creates the
`plans` and `recharges` tables, adds subscription columns to `customers`, seeds
the 20 plans, and **backfills all 149 customers** with their current plan and
expiry. The 2 prepaid customers start with no plan.

---

## Project structure

```
src/
  config.js         brand, staff email, cache TTL
  lib/supabase.js   client
  lib/auth.js       sign in/out, session, online status
  lib/db.js         CRUD, soft delete, offline cache
  lib/search.js     bilingual + phone search
  lib/translit.js   Marathi auto-fill dictionary
  lib/validate.js   form rules
  App.jsx           wires it together
```

Brand colours are sampled from the logo, in `tailwind.config.js`:
orange `#FF7F15` → `brand-500`, black `#141300` → `ink`.
