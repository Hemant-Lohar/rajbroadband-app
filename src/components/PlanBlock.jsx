import { statusOf, expiryPhrase, formatDate } from "../lib/subscription";
import { Bolt, ChevRight, Pause } from "./icons";

// The subscription block shown on the customer profile, under the
// identity/contact fields. Kept deliberately compact — plan, status,
// expiry, a Recharge button, and a one-line link into history.
export default function PlanBlock({
  customer,
  planName,
  rechargeCount,
  lastRechargeDate,
  canEdit,
  onRecharge,
  onHistory,
  onToggleSuspend,
}) {
  const st = statusOf(customer);
  const phrase = expiryPhrase(customer);
  const hasPlan = Boolean(customer.planId);
  const suspended = customer.manualStatus === "suspended";

  return (
    <div className="mt-3 rounded-2xl border border-hairline bg-white p-4 shadow-card">
      {/* status badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{ background: st.bg, color: st.text }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: st.dot }}
          />
          {st.label}
        </span>
        {hasPlan && customer.expiryDate && (
          <span className="text-[12px] text-muted">
            {formatDate(customer.expiryDate)}
          </span>
        )}
      </div>

      {/* plan name + expiry phrase */}
      <div className="mt-3">
        {hasPlan ? (
          <>
            <p className="flex items-center gap-1.5 font-display text-[15px] font-bold text-ink">
              <Bolt size={15} className="text-brand-500" />
              {planName || "Plan"}
            </p>
            {phrase && !suspended && (
              <p className="mt-0.5 text-[13px] text-muted">{phrase}</p>
            )}
            {suspended && (
              <p className="mt-0.5 text-[13px] text-muted">
                Manually suspended
              </p>
            )}
          </>
        ) : (
          <p className="text-[14px] text-muted">
            No plan yet — recharge to set one up.
          </p>
        )}
      </div>

      {/* actions */}
      {canEdit && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onRecharge}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 py-2.5 text-[14px] font-semibold text-white shadow-glow transition active:scale-[0.98]"
          >
            <Bolt size={16} /> Recharge
          </button>
          {hasPlan && (
            <button
              onClick={onToggleSuspend}
              className={`grid h-[42px] w-[42px] place-items-center rounded-xl border transition active:scale-[0.95] ${
                suspended
                  ? "border-brand-200 bg-brand-50 text-brand-600"
                  : "border-hairline bg-white text-muted hover:text-ink"
              }`}
              title={suspended ? "Un-suspend" : "Suspend"}
              aria-label={suspended ? "Un-suspend" : "Suspend"}
            >
              <Pause size={16} />
            </button>
          )}
        </div>
      )}

      {/* history link */}
      {rechargeCount > 0 && (
        <button
          onClick={onHistory}
          className="mt-3 flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left text-[12px] text-muted transition hover:text-ink"
        >
          <span>
            {rechargeCount} {rechargeCount === 1 ? "recharge" : "recharges"}
            {lastRechargeDate && ` · last ${formatDate(lastRechargeDate)}`}
          </span>
          <ChevRight size={15} />
        </button>
      )}
    </div>
  );
}
