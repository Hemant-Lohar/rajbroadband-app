// ─────────────────────────────────────────────────────────────
//  Subscription status — derived, never stored.
//
//  A customer's standing is computed live from their expiry date
//  plus an optional manual "suspended" override. This can't drift
//  out of sync the way a hand-typed status field would.
// ─────────────────────────────────────────────────────────────

export const EXPIRING_SOON_DAYS = 3;

// Status keys and their display metadata.
export const STATUS = {
  active: {
    key: "active",
    label: "Active",
    dot: "#22c55e",
    text: "#15803d",
    bg: "#f0fdf4",
  },
  expiring: {
    key: "expiring",
    label: "Expiring soon",
    dot: "#f59e0b",
    text: "#b45309",
    bg: "#fffbeb",
  },
  expired: {
    key: "expired",
    label: "Expired",
    dot: "#ef4444",
    text: "#dc2626",
    bg: "#fef2f2",
  },
  suspended: {
    key: "suspended",
    label: "Suspended",
    dot: "#3f3f46",
    text: "#3f3f46",
    bg: "#f4f4f5",
  },
  none: {
    key: "none",
    label: "No plan",
    dot: "#cbd5e1",
    text: "#94a3b8",
    bg: "#f8fafc",
  },
};

// Whole-day difference from now to the expiry date (can be negative).
export function daysUntil(expiry) {
  if (!expiry) return null;
  const exp = new Date(expiry);
  if (isNaN(exp)) return null;
  const now = new Date();
  // Compare at day granularity so "expires today" reads as 0, not -0.4.
  const ms = exp.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// The single source of truth for a customer's status.
export function statusOf(customer) {
  if (customer?.manualStatus === "suspended") return STATUS.suspended;
  if (!customer?.planId || !customer?.expiryDate) return STATUS.none;

  const d = daysUntil(customer.expiryDate);
  if (d === null) return STATUS.none;
  if (d < 0) return STATUS.expired;
  if (d <= EXPIRING_SOON_DAYS) return STATUS.expiring;
  return STATUS.active;
}

// Human phrase for the profile, e.g. "expires in 12 days" / "expired 4 days ago".
export function expiryPhrase(customer) {
  const d = daysUntil(customer?.expiryDate);
  if (d === null) return null;
  if (d < 0) {
    const n = Math.abs(d);
    return `expired ${n} ${n === 1 ? "day" : "days"} ago`;
  }
  if (d === 0) return "expires today";
  if (d === 1) return "expires tomorrow";
  return `expires in ${d} days`;
}

// Format an expiry timestamp as a plain date, e.g. "24 Sep 2026".
export function formatDate(value) {
  if (!value) return "";
  const dt = new Date(value);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Given a plan's duration and a recharge date, compute the expiry.
// Rule (decided with the operator): expiry = recharge date + duration,
// counted from the day of payment — late renewals do NOT keep lost days.
export function computeExpiry(rechargeDateStr, durationDays) {
  if (!rechargeDateStr || !durationDays) return null;
  const d = new Date(rechargeDateStr + "T23:59:00");
  if (isNaN(d)) return null;
  d.setDate(d.getDate() + Number(durationDays));
  return d;
}

// Is this recharge outstanding?
export function isPending(recharge) {
  return recharge?.paymentStatus === "pending";
}
