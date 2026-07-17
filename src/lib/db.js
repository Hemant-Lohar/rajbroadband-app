import { supabase } from "./supabase";
import { KEYS, CACHE_TTL_MS } from "../config";

const COLS =
  "id, name, marathi_name, username, contact, deleted_at, plan_id, expiry_date, last_recharge_date, last_amount, manual_status";

// Supabase is snake_case; the UI is camelCase.
const fromRow = (r) => ({
  id: r.id,
  name: r.name || "",
  marathiName: r.marathi_name || "",
  username: r.username || "",
  contact: r.contact || "",
  deletedAt: r.deleted_at || null,
  planId: r.plan_id || null,
  expiryDate: r.expiry_date || null,
  lastRechargeDate: r.last_recharge_date || null,
  lastAmount: r.last_amount ?? null,
  manualStatus: r.manual_status || null,
});

const toRow = (c) => ({
  name: c.name || "",
  marathi_name: c.marathiName || "",
  username: c.username || "",
  contact: c.contact || "",
});

// ── offline cache ─────────────────────────────────────────────
// Lookups must work with no signal, so every successful fetch is
// mirrored to localStorage and read back when offline.

export function readCache() {
  try {
    const raw = localStorage.getItem(KEYS.cache);
    if (!raw) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

export function cacheAge() {
  try {
    const t = localStorage.getItem(KEYS.cachedAt);
    if (!t) return Infinity;
    return Date.now() - new Date(t).getTime();
  } catch {
    return Infinity;
  }
}

export function isCacheFresh() {
  return cacheAge() < CACHE_TTL_MS;
}

export function writeCache(list) {
  try {
    localStorage.setItem(KEYS.cache, JSON.stringify(list));
    localStorage.setItem(KEYS.cachedAt, new Date().toISOString());
  } catch {
    /* quota / private mode — cache is best-effort */
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(KEYS.cache);
    localStorage.removeItem(KEYS.cachedAt);
  } catch {
    /* ignore */
  }
}

// ── reads ─────────────────────────────────────────────────────

// Active customers only (deleted ones are filtered out).
// Returns { list, stale } — stale means it came from cache because
// the network was unreachable.
export async function fetchCustomers() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(COLS)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;

    const list = data.map(fromRow);
    writeCache(list);
    return { list, stale: false };
  } catch (err) {
    const cached = readCache();
    if (cached) return { list: cached, stale: true };
    throw err;
  }
}

// The trash. Online only — no point caching deleted rows.
export async function fetchDeleted() {
  const { data, error } = await supabase
    .from("customers")
    .select(COLS)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return data.map(fromRow);
}

// ── writes (require a connection) ─────────────────────────────

export async function addCustomer(customer) {
  const { data, error } = await supabase
    .from("customers")
    .insert(toRow(customer))
    .select(COLS)
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateCustomer(id, customer) {
  const { data, error } = await supabase
    .from("customers")
    .update(toRow(customer))
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return fromRow(data);
}

// Soft delete — the row stays, just marked. Recoverable.
export async function softDeleteCustomer(id) {
  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function restoreCustomer(id) {
  const { data, error } = await supabase
    .from("customers")
    .update({ deleted_at: null })
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) throw error;
  return fromRow(data);
}

// Permanent — actually removes the row. No undo.
// This is also the data-erasure path if a customer asks to be forgotten.
export async function purgeCustomer(id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ── bulk trash operations ─────────────────────────────────────

// Restore everything in the trash. Returns the restored customers.
export async function restoreAll() {
  const { data, error } = await supabase
    .from("customers")
    .update({ deleted_at: null })
    .not("deleted_at", "is", null)
    .select(COLS);

  if (error) throw error;
  return data.map(fromRow);
}

// Permanently erase everything in the trash. No undo.
export async function purgeAll() {
  const { error } = await supabase
    .from("customers")
    .delete()
    .not("deleted_at", "is", null);

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
//  Plans
// ═══════════════════════════════════════════════════════════════

const planFromRow = (r) => ({
  id: r.id,
  name: r.name,
  speedMbps: r.speed_mbps,
  durationDays: r.duration_days,
  unlimited: r.unlimited,
  active: r.active,
  sortOrder: r.sort_order,
});

const PLAN_CACHE_KEY = "rajbb.plans.v1";

export function readPlanCache() {
  try {
    const raw = localStorage.getItem(PLAN_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchPlans() {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select(
        "id, name, speed_mbps, duration_days, unlimited, active, sort_order",
      )
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const list = data.map(planFromRow);
    try {
      localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(list));
    } catch {
      /* best effort */
    }
    return list;
  } catch (err) {
    const cached = readPlanCache();
    if (cached) return cached;
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
//  Recharges
// ═══════════════════════════════════════════════════════════════

const rechargeFromRow = (r) => ({
  id: r.id,
  customerId: r.customer_id,
  planId: r.plan_id,
  planName: r.plan_name,
  rechargeDate: r.recharge_date,
  expiryDate: r.expiry_date,
  amount: r.amount ?? null,
  paymentStatus: r.payment_status,
  paidDate: r.paid_date || null,
  note: r.note || null,
  createdAt: r.created_at,
});

const RCOLS =
  "id, customer_id, plan_id, plan_name, recharge_date, expiry_date, amount, payment_status, paid_date, note, created_at";

// All recharges for one customer, newest first.
export async function fetchCustomerRecharges(customerId) {
  const { data, error } = await supabase
    .from("recharges")
    .select(RCOLS)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rechargeFromRow);
}

// Record a recharge AND update the customer's current-state cache in one go.
// Returns { recharge, customer } with the fresh rows.
export async function recordRecharge({
  customer,
  plan,
  rechargeDate,
  expiryDate,
  amount,
  paymentStatus,
}) {
  const { data: rData, error: rErr } = await supabase
    .from("recharges")
    .insert({
      customer_id: customer.id,
      plan_id: plan.id,
      plan_name: plan.name,
      recharge_date: rechargeDate,
      expiry_date: expiryDate,
      amount: amount === "" || amount == null ? null : Number(amount),
      payment_status: paymentStatus,
      paid_date: paymentStatus === "paid" ? rechargeDate : null,
    })
    .select(RCOLS)
    .single();
  if (rErr) throw rErr;

  const { data: cData, error: cErr } = await supabase
    .from("customers")
    .update({
      plan_id: plan.id,
      expiry_date: expiryDate,
      last_recharge_date: rechargeDate,
      last_amount: amount === "" || amount == null ? null : Number(amount),
      manual_status: null, // a fresh recharge clears any manual suspension
    })
    .eq("id", customer.id)
    .select(COLS)
    .single();
  if (cErr) throw cErr;

  return { recharge: rechargeFromRow(rData), customer: fromRow(cData) };
}

// Mark a pending recharge as paid.
export async function markRechargePaid(rechargeId, paidDate) {
  const { data, error } = await supabase
    .from("recharges")
    .update({ payment_status: "paid", paid_date: paidDate })
    .eq("id", rechargeId)
    .select(RCOLS)
    .single();
  if (error) throw error;
  return rechargeFromRow(data);
}

// Every currently-pending recharge, with its customer joined, newest first.
export async function fetchPendingRecharges() {
  const { data, error } = await supabase
    .from("recharges")
    .select(
      RCOLS + ", customer:customers(id, name, marathi_name, username, contact)",
    )
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    ...rechargeFromRow(r),
    customer: r.customer
      ? {
          id: r.customer.id,
          name: r.customer.name || "",
          marathiName: r.customer.marathi_name || "",
          username: r.customer.username || "",
          contact: r.customer.contact || "",
        }
      : null,
  }));
}

// Toggle / set a customer's manual suspension.
export async function setManualStatus(customerId, manualStatus) {
  const { data, error } = await supabase
    .from("customers")
    .update({ manual_status: manualStatus })
    .eq("id", customerId)
    .select(COLS)
    .single();
  if (error) throw error;
  return fromRow(data);
}
