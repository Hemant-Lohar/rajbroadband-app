// Search that works across English name, Marathi name, username and phone.
// We use normalized substring matching (not fuzzy) because fuzzy scoring
// mangles Devanagari and phone numbers — predictable matching is better here.

function normLatin(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

// For phone matching: keep only digits.
function digits(s) {
  return String(s || "").replace(/\D/g, "");
}

// Marathi/Devanagari: strip common diacritics-insensitivity is risky, so we
// just lowercase-equivalent by trimming whitespace. Devanagari has no case.
function normDeva(s) {
  return String(s || "").trim();
}

export function searchCustomers(list, rawQuery) {
  const q = String(rawQuery || "").trim();
  if (!q) return [];

  const qLatin = normLatin(q);
  const qDigits = digits(q);
  const isNumeric =
    qDigits.length > 0 && qDigits.length === q.replace(/\s/g, "").length;

  const scored = [];
  for (const c of list) {
    const name = normLatin(c.name);
    const user = normLatin(c.username);
    const marathi = normDeva(c.marathiName);
    const phone = digits(c.contact);

    let score = -1;

    // Phone search (when the query looks numeric)
    if (isNumeric && qDigits.length >= 2) {
      if (phone.startsWith(qDigits)) score = Math.max(score, 95);
      else if (phone.includes(qDigits)) score = Math.max(score, 70);
    }

    // English name
    if (qLatin) {
      if (name.startsWith(qLatin)) score = Math.max(score, 100);
      else if (name.includes(qLatin)) score = Math.max(score, 80);
      // word-boundary match (surname etc.)
      else if (name.split(/\s+/).some((w) => w.startsWith(qLatin)))
        score = Math.max(score, 88);
    }

    // Username
    if (qLatin) {
      if (user.startsWith(qLatin)) score = Math.max(score, 90);
      else if (user.includes(qLatin)) score = Math.max(score, 65);
    }

    // Marathi name (match against the raw query, not lowercased)
    if (q) {
      if (marathi.startsWith(q)) score = Math.max(score, 100);
      else if (marathi.includes(q)) score = Math.max(score, 82);
      else if (marathi.split(/\s+/).some((w) => w.startsWith(q)))
        score = Math.max(score, 88);
    }

    if (score >= 0) scored.push({ c, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.c.name).localeCompare(String(b.c.name));
  });

  return scored.map((s) => s.c);
}

// Highlight helper: returns array of {text, hit} chunks for a field.
export function highlight(text, rawQuery) {
  const value = String(text || "");
  const q = String(rawQuery || "").trim();
  if (!q) return [{ text: value, hit: false }];

  const lowerVal = value.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lowerVal.indexOf(lowerQ);
  if (idx === -1) return [{ text: value, hit: false }];

  return [
    { text: value.slice(0, idx), hit: false },
    { text: value.slice(idx, idx + q.length), hit: true },
    { text: value.slice(idx + q.length), hit: false },
  ].filter((p) => p.text.length > 0);
}
