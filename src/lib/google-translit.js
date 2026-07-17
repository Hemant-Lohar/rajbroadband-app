// ─────────────────────────────────────────────────────────────
//  Google Input Tools — fallback transliteration for words the
//  dictionary hasn't seen yet.
//
//  This is a SOFT enhancement. It's an unofficial Google endpoint,
//  so it may be blocked by CORS, rate-limited, or changed without
//  notice. Every failure path falls back silently to the
//  dictionary-only behaviour — the app must never break because
//  of this.
//
//  No API key. No billing. One call per unknown word, ever:
//  once a customer is saved, that word joins the local dictionary
//  and is never looked up again.
// ─────────────────────────────────────────────────────────────

const ENDPOINT = "https://inputtools.google.com/request";
const CACHE_KEY = "rajbb.translit.v1";
const TIMEOUT_MS = 4000;

// Once we learn the endpoint is unreachable (CORS/blocked/offline),
// stop hammering it for the rest of the session.
let disabled = false;

// ── persistent word cache ─────────────────────────────────────
let memCache = null;

function loadCache() {
  if (memCache) return memCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memCache = raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    memCache = new Map();
  }
  return memCache;
}

function saveCache() {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(Object.fromEntries(memCache)),
    );
  } catch {
    /* best effort */
  }
}

export function isDisabled() {
  return disabled;
}

// ── the call ──────────────────────────────────────────────────

// Transliterate one English word → Devanagari.
// Returns null on any failure (caller falls back to the dictionary).
async function lookupWord(word) {
  const key = word.toLowerCase();
  const cache = loadCache();

  if (cache.has(key)) return cache.get(key);
  if (disabled) return null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;

  const params = new URLSearchParams({
    text: key,
    itc: "mr-t-i0-und", // Marathi transliteration
    num: "1",
    cp: "0",
    cs: "1",
    ie: "utf-8",
    oe: "utf-8",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    // Shape: ["SUCCESS", [[ "vikas", ["विकास", ...], [], {} ]]]
    if (!Array.isArray(data) || data[0] !== "SUCCESS")
      throw new Error("bad response");

    const candidates = data?.[1]?.[0]?.[1];
    const best = Array.isArray(candidates) ? candidates[0] : null;
    if (!best || typeof best !== "string") throw new Error("no candidate");

    cache.set(key, best);
    saveCache();
    return best;
  } catch (err) {
    // A CORS block surfaces as a TypeError with no status — treat any
    // hard failure as "this endpoint isn't usable here" and stop trying.
    if (err?.name !== "AbortError") disabled = true;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Transliterate the words a dictionary couldn't resolve.
// `words` is the list of still-English words from the suggestion.
// Returns a Map(word → devanagari) containing only what succeeded.
export async function transliterateWords(words) {
  const out = new Map();
  const unique = [
    ...new Set(words.map((w) => w.toLowerCase()).filter(Boolean)),
  ];
  if (unique.length === 0 || disabled) return out;

  const results = await Promise.all(
    unique.map(async (w) => [w, await lookupWord(w)]),
  );

  for (const [w, hit] of results) {
    if (hit) out.set(w, hit);
  }
  return out;
}
