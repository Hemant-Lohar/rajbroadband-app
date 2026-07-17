import { useEffect } from "react";
import { X, Spinner, Check, Bolt } from "./icons";
import { formatDate } from "../lib/subscription";

function AmountText({ amount }) {
  if (amount == null) return <span className="text-muted">—</span>;
  return <>₹{Number(amount).toLocaleString("en-IN")}</>;
}

export default function HistorySheet({
  customer,
  items,
  loading,
  busyId,
  canEdit,
  onClose,
  onMarkPaid,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop animate-sheet-in sm:max-h-[85dvh] sm:max-w-md sm:rounded-3xl">
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-hairline" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Recharge history
            </h2>
            <p className="text-[12px] text-muted">{customer.name}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-white active:scale-90"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pb-safe scroll-thin flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-14 text-muted">
              <Spinner size={22} />
              <p className="text-sm">Loading…</p>
            </div>
          ) : items.length === 0 ? (
            <p className="py-14 text-center text-sm text-muted">
              No recharges yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-hairline bg-white p-3.5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold text-ink">
                        <Bolt size={14} className="shrink-0 text-brand-500" />
                        <span className="truncate">{r.planName}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {formatDate(r.rechargeDate)} →{" "}
                        {formatDate(r.expiryDate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-ink tabular">
                        <AmountText amount={r.amount} />
                      </p>
                      <span
                        className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          r.paymentStatus === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {canEdit && r.paymentStatus === "pending" && (
                    <button
                      onClick={() => onMarkPaid(r)}
                      disabled={busyId === r.id}
                      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 py-2 text-[13px] font-semibold text-green-700 transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {busyId === r.id ? (
                        <Spinner size={14} />
                      ) : (
                        <Check size={14} strokeWidth={2.5} />
                      )}
                      Mark as paid
                    </button>
                  )}

                  {r.note && (
                    <p className="mt-2 text-[11px] italic text-muted/80">
                      {r.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
