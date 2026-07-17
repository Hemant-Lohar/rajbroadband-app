// ─────────────────────────────────────────────────────────────
//  Raj Broadband — app configuration
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name: "Raj Broadband",
  tagline: "Customer directory",
  // Prefixed to 10-digit numbers for WhatsApp links (91 = India)
  countryCode: "91",
};

// The shared staff account (created in the Supabase dashboard).
// Pre-filled on the login screen so staff only type the password.
export const STAFF_EMAIL = "admin@rajbroadband.local";

// How long a cached list is considered fresh. Within this window the
// app skips the network call entirely and renders straight from cache.
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Local cache keys
export const KEYS = {
  cache: "rajbb.cache.v3",
  cachedAt: "rajbb.cachedAt.v3",
};
