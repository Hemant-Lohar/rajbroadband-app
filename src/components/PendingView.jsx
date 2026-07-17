import { formatDate } from "../lib/subscription";
import { Rupee, Check, Spinner, User, Phone } from "./icons";

function AmountText({ amount }) {
  if (amount == null) return <span className="text-muted">—</span>;
  return <>₹{Number(amount).toLocaleString("en-IN")}</>;
}

export default function PendingView({
  items,
  loading,
  busyId,
  total,
  onSelect,
  onMarkPaid,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 pt-24 text-muted">
        <Spinner size={24} />
        <p className="text-sm">Loading pending payments…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 pt-20 text-center animate-fade-in">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white text-green-600 shadow-card">
          <Check size={26} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-lg font-bold text-ink">
          Nothing pending
        </h2>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          Every recharge is marked paid. Nice.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-3 sm:pb-6">
      {/* outstanding total */}
      {total > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="flex items-center gap-2 text-[13px] font-medium text-amber-800">
            <Rupee size={16} /> Total outstanding
          </span>
          <span className="font-display text-lg font-bold text-amber-800 tabular">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((r) => {
          const c = r.customer;
          const digits = String(c?.contact || "").replace(/\D/g, "");
          return (
            <li
              key={r.id}
              className="rounded-2xl border border-hairline bg-white p-3.5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => c && onSelect(c)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <User size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">
                      {c?.name || "Unknown"}
                    </span>
                    <span className="block truncate text-[12.5px] text-muted">
                      {r.planName} · {formatDate(r.rechargeDate)}
                    </span>
                  </span>
                </button>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-ink tabular">
                    <AmountText amount={r.amount} />
                  </p>
                  {digits && (
                    <a
                      href={`tel:${digits}`}
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted transition hover:text-brand-600"
                    >
                      <Phone size={12} /> call
                    </a>
                  )}
                </div>
              </div>

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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
