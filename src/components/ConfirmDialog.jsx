import { useEffect } from "react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  busy = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-pop animate-slide-up">
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-6 flex gap-2.5">
          <button
            onClick={onCancel}
            className="min-h-[48px] flex-1 rounded-xl border border-hairline bg-white py-3 text-[15px] font-semibold text-ink transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-[48px] flex-1 rounded-xl py-3 text-[15px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-60 ${
              danger ? "bg-red-600" : "bg-ink"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
