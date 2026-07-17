import { hasLatin } from "./translit";

// Indian mobile numbers start 6-9. A number starting 0-5 is almost
// certainly a typo — we warn, but don't block (in case of a landline).
const MOBILE_START = /^[6-9]/;

export function digitsOnly(text) {
  return String(text || "").replace(/\D/g, "");
}

// Hard errors — these block saving.
export function validateCustomer(form) {
  const errors = {};

  if (!String(form.name || "").trim()) {
    errors.name = "Enter the English name.";
  }

  const marathi = String(form.marathiName || "").trim();
  if (!marathi) {
    errors.marathiName = "Enter the Marathi name.";
  } else if (hasLatin(marathi)) {
    // A half-translated name would be invisible to Marathi search.
    errors.marathiName = "Still has English letters — finish the Marathi name.";
  }

  if (!String(form.username || "").trim()) {
    errors.username = "Enter the username.";
  }

  const phone = digitsOnly(form.contact);
  if (!phone) {
    errors.contact = "Enter the contact number.";
  } else if (phone.length !== 10) {
    errors.contact = `Needs 10 digits — you have ${phone.length}.`;
  }

  return errors;
}

// Soft warnings — shown, but never block saving.
export function warnCustomer(form, customers, editingId) {
  const warnings = {};

  const phone = digitsOnly(form.contact);

  if (phone.length === 10 && !MOBILE_START.test(phone)) {
    warnings.contact =
      "Indian mobile numbers usually start with 6-9. Double-check this.";
  }

  // Shared family/shop lines are legitimate (32 exist in the original
  // data), so this is a heads-up, not an error.
  if (phone.length === 10) {
    const others = customers.filter(
      (c) => c.id !== editingId && digitsOnly(c.contact) === phone,
    );
    if (others.length > 0) {
      const names = others.map((c) => c.name || c.marathiName).filter(Boolean);
      warnings.contactDuplicate =
        others.length === 1
          ? `This number is also on ${names[0]}'s account.`
          : `This number is also on ${others.length} other accounts.`;
    }
  }

  return warnings;
}
