import { useEffect, useState, useMemo, useRef } from "react";
import { X, Check, Spinner, Sparkle, Alert } from "./icons";
import { suggestMarathi, hasLatin } from "../lib/translit";
import { transliterateWords } from "../lib/google-translit";
import { validateCustomer, warnCustomer, digitsOnly } from "../lib/validate";

const EMPTY = { name: "", marathiName: "", username: "", contact: "" };

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  inputMode,
  error,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}{" "}
        {hint && <span className="font-normal text-muted">· {hint}</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-base outline-none transition-colors sm:text-[15px] ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : "border-hairline focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        }`}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

export default function CustomerForm({
  initial,
  saving = false,
  dict,
  customers = [],
  onCancel,
  onSave,
}) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  // Once the user edits the Marathi field by hand, stop auto-filling it.
  const [touchedMarathi, setTouchedMarathi] = useState(isEdit);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Words Google has resolved for us this session.
  const [extra, setExtra] = useState(() => new Map());
  const [looking, setLooking] = useState(false);
  const reqRef = useRef(0);

  const suggestion = useMemo(
    () => suggestMarathi(form.name, dict, extra),
    [form.name, dict, extra],
  );

  // Auto-fill Marathi — never over the user's own edits.
  useEffect(() => {
    if (touchedMarathi) return;
    setForm((f) => ({ ...f, marathiName: suggestion.text }));
  }, [suggestion.text, touchedMarathi]);

  // For words the dictionary doesn't know, ask Google Input Tools.
  // Debounced, and entirely best-effort: any failure (CORS, offline,
  // rate limit) just leaves the word in English, exactly as before.
  const unknownKey = suggestion.unknown.join("|").toLowerCase();

  useEffect(() => {
    if (touchedMarathi || isEdit) return;
    if (!unknownKey) {
      setLooking(false);
      return;
    }

    const words = unknownKey.split("|").filter(Boolean);
    const id = ++reqRef.current;
    setLooking(true);

    const t = setTimeout(async () => {
      const found = await transliterateWords(words);
      // A newer keystroke superseded this lookup — discard it.
      if (id !== reqRef.current) return;
      setLooking(false);
      if (found.size > 0) {
        setExtra((prev) => {
          const next = new Map(prev);
          for (const [k, v] of found) next.set(k, v);
          return next;
        });
      }
    }, 450);

    return () => clearTimeout(t);
  }, [unknownKey, touchedMarathi, isEdit]);

  const warnings = useMemo(
    () => warnCustomer(form, customers, initial?.id ?? null),
    [form, customers, initial],
  );

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function submit() {
    const e = validateCustomer(form);
    setErrors(e);
    setShowErrors(true);
    if (Object.keys(e).length > 0) return;

    onSave({
      name: form.name.trim(),
      marathiName: form.marathiName.trim(),
      username: form.username.trim(),
      contact: digitsOnly(form.contact),
    });
  }

  const shown = showErrors ? errors : {};

  // Hint under the Marathi field
  let marathiHint = null;
  if (!isEdit && suggestion.totalCount > 0 && !shown.marathiName) {
    if (looking) {
      marathiHint = (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Spinner size={12} /> Looking up the rest…
        </p>
      );
    } else if (
      suggestion.complete &&
      !touchedMarathi &&
      form.marathiName === suggestion.text
    ) {
      marathiHint = (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-brand-600">
          <Sparkle size={13} className="mt-px shrink-0" />
          {suggestion.usedFallback
            ? "Auto-filled — a guessed spelling is included, so please check it."
            : "Filled from your existing customers — check it’s right."}
        </p>
      );
    } else if (hasLatin(form.marathiName)) {
      marathiHint = (
        <p className="mt-1.5 text-xs text-muted">
          Part of this name is new — type it in Devanagari (your phone’s Marathi
          keyboard will transliterate as you type).
        </p>
      );
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop animate-sheet-in sm:max-h-[85dvh] sm:max-w-md sm:rounded-3xl">
        {/* grab handle — mobile bottom-sheet affordance */}
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-hairline" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-3">
          <h2 className="font-display text-lg font-bold text-ink">
            {isEdit ? "Edit customer" : "Add customer"}
          </h2>
          <button
            onClick={onCancel}
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-white active:scale-90"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field
            label="Name"
            hint="English"
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="English name"
            error={shown.name}
          />

          <div>
            <Field
              label="नाव"
              hint="Marathi"
              value={form.marathiName}
              onChange={(v) => {
                setTouchedMarathi(true);
                set("marathiName", v);
              }}
              placeholder="Marathi name"
              error={shown.marathiName}
            />
            {marathiHint}
          </div>

          <Field
            label="Username"
            value={form.username}
            onChange={(v) => set("username", v)}
            placeholder="Username"
            error={shown.username}
          />

          <div>
            <Field
              label="Contact"
              hint="10 digits"
              value={form.contact}
              // Digits only, capped at 10 — letters simply never appear.
              onChange={(v) => set("contact", digitsOnly(v).slice(0, 10))}
              placeholder="Contact number"
              inputMode="numeric"
              error={shown.contact}
            />
            {!shown.contact && warnings.contact && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
                <Alert size={13} className="mt-px shrink-0" />
                {warnings.contact}
              </p>
            )}
            {warnings.contactDuplicate && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                <Alert size={13} className="mt-px shrink-0" />
                {warnings.contactDuplicate}
              </p>
            )}
          </div>
        </div>

        <div className="pb-safe flex shrink-0 gap-2.5 border-t border-hairline bg-surface px-5 pt-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-hairline bg-white py-3 text-[15px] font-semibold text-ink transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-xl bg-ink py-3 text-[15px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Spinner size={18} /> Saving…
              </>
            ) : (
              <>
                <Check size={18} strokeWidth={2.25} />{" "}
                {isEdit ? "Save changes" : "Add customer"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
