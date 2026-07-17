// ─────────────────────────────────────────────────────────────
//  Name suggestion — built entirely from YOUR OWN customer data.
//
//  Every existing customer is a verified English↔Marathi pair.
//  We split them into words to learn: patil → पाटील, sanjay → संजय.
//  No API, no network, works offline, and it gets better every
//  time a customer is added.
// ─────────────────────────────────────────────────────────────

const LATIN = /[A-Za-z]/;

// Build { englishWord(lowercase) → marathiWord } from the customer list.
// Only learns from rows where the word counts line up, so we never
// mis-pair "Shreyas Hari Pethkar" with a 2-word Marathi name.
export function buildDictionary(customers) {
  const dict = new Map();
  const votes = new Map(); // word → Map(marathi → count), to settle disagreements

  for (const c of customers) {
    const en = String(c.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const mr = String(c.marathiName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (en.length === 0 || en.length !== mr.length) continue;

    for (let i = 0; i < en.length; i++) {
      const key = en[i].toLowerCase();
      const val = mr[i];
      if (!key || !val || LATIN.test(val)) continue;

      if (!votes.has(key)) votes.set(key, new Map());
      const v = votes.get(key);
      v.set(val, (v.get(val) || 0) + 1);
    }
  }

  // Pick the most common Marathi spelling for each English word.
  for (const [key, v] of votes) {
    let best = null;
    let bestN = 0;
    for (const [val, n] of v) {
      if (n > bestN) {
        best = val;
        bestN = n;
      }
    }
    if (best) dict.set(key, best);
  }

  return dict;
}

// Suggest a Marathi name for an English one.
//
// `dict`  — learned from your own customers (exact, offline, free)
// `extra` — optional Map(word → devanagari) filled in by Google Input
//           Tools for words the dictionary didn't know. Always applied
//           *after* the dictionary, so your own verified spellings win.
//
// Returns { text, complete, knownCount, totalCount, unknown, usedFallback }.
// `unknown` lists the words still in English — exactly what Google
// should be asked to resolve.
export function suggestMarathi(englishName, dict, extra) {
  const words = String(englishName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return {
      text: "",
      complete: false,
      knownCount: 0,
      totalCount: 0,
      unknown: [],
      usedFallback: false,
    };
  }

  let known = 0;
  let usedFallback = false;
  const unknown = [];

  const out = words.map((w) => {
    const key = w.toLowerCase();

    // 1. Your own data first — always the most trustworthy.
    const hit = dict?.get(key);
    if (hit) {
      known++;
      return hit;
    }

    // 2. Google's guess, if we have one for this word.
    const guess = extra?.get(key);
    if (guess) {
      known++;
      usedFallback = true;
      return guess;
    }

    // 3. Still unresolved — leave it in English so it's visibly unfinished.
    unknown.push(w);
    return w;
  });

  return {
    text: known > 0 ? out.join(" ") : "",
    complete: known === words.length,
    knownCount: known,
    totalCount: words.length,
    unknown,
    usedFallback,
  };
}

// True if the Marathi field still has English letters left in it.
export function hasLatin(text) {
  return LATIN.test(String(text || ""));
}
