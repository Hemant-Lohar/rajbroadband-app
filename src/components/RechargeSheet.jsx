import { useEffect, useState, useMemo } from "react";
import { X, Check, Spinner, Bolt, Alert } from "./icons";
import {
  computeExpiry,
  formatDate,
  statusOf,
  daysUntil,
} from "../lib/subscription";

function todayStr() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export default function RechargeSheet({
  customer,
  plans,
  saving,
  onCancel,
  onSave,
}) {
  // Default the plan to whatever the customer is currently on.
  const [planId, setPlanId] = useState(customer.planId || "");
  const [rechargeDate, setRechargeDate] = useState(todayStr());
  const [amount, setAmount] = useState(
    customer.lastAmount != null ? String(customer.lastAmount) : "",
  );
  const [paymentStatus, setPaymentStatus] = useState("pending"); // credit is the norm
  const [error, setError] = useState("");
  const [confirmActive, setConfirmActive] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const plan = useMemo(
    () => plans.find((p) => p.id === Number(planId)) || null,
    [plans, planId],
  );

  const expiry = useMemo(() => {
    if (!plan) return null;
    return computeExpiry(rechargeDate, plan.durationDays);
  }, [plan, rechargeDate]);

  function submit() {
    if (!plan) {
      setError("Pick a plan.");
      return;
    }
    if (!rechargeDate) {
      setError("Pick a recharge date.");
      return;
    }
    if (amount !== "" && (isNaN(Number(amount)) || Number(amount) < 0)) {
      setError("Amount looks wrong.");
      return;
    }
    // Guard against an accidental double-recharge: if the customer's current
    // plan is still active, make staff confirm once. This still allows early
    // renewals, upgrades, and corrections — it just isn't a silent double-tap.
    const active = Boolean(
      customer.planId &&
      customer.expiryDate &&
      daysUntil(customer.expiryDate) >= 0 &&
      customer.manualStatus !== "suspended",
    );
    if (active && !confirmActive) {
      setConfirmActive(true);
      return;
    }
    onSave({
      customer,
      plan,
      rechargeDate,
      expiryDate: expiry.toISOString(),
      amount: amount === "" ? null : Number(amount),
      paymentStatus,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop animate-sheet-in sm:max-h-[85dvh] sm:max-w-md sm:rounded-3xl">
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-hairline" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Bolt size={18} className="text-brand-500" /> Recharge
          </h2>
          <button
            onClick={onCancel}
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-white active:scale-90"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 py-5">
          {/* who */}
          <div className="rounded-xl bg-white px-4 py-3 shadow-card">
            <p className="font-semibold text-ink">{customer.name}</p>
            {customer.marathiName && (
              <p className="text-[13px] text-muted">{customer.marathiName}</p>
            )}
          </div>

          {/* plan */}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Plan
            </span>
            <select
              value={planId}
              onChange={(e) => {
                setPlanId(e.target.value);
                setError("");
              }}
              className="box-border block w-full min-w-0 max-w-full appearance-none rounded-xl border border-hairline bg-white px-3.5 py-3 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-[15px]"
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {/* date */}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Recharge date
            </span>
            <input
              type="date"
              value={rechargeDate}
              max={todayStr()}
              onChange={(e) => setRechargeDate(e.target.value)}
              className="box-border block w-full min-w-0 max-w-full rounded-xl border border-hairline bg-white px-3.5 py-3 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-[15px]"
            />
          </label>

          {/* computed expiry */}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-3">
            <span className="text-[13px] font-medium text-muted">
              New expiry
            </span>
            <span className="font-semibold text-brand-700">
              {expiry ? formatDate(expiry) : "—"}
              {plan && (
                <span className="ml-1 text-[12px] font-normal text-muted">
                  ({plan.durationDays}d)
                </span>
              )}
            </span>
          </div>

          {/* amount */}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Amount <span className="font-normal text-muted">· ₹</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder={
                customer.lastAmount != null
                  ? String(customer.lastAmount)
                  : "Amount paid"
              }
              className="w-full rounded-xl border border-hairline bg-white px-3.5 py-3 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-[15px]"
            />
            {customer.lastAmount != null && (
              <span className="mt-1 block text-xs text-muted">
                Pre-filled from last recharge — edit if it changed.
              </span>
            )}
          </label>

          {/* payment */}
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Payment
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {["pending", "paid"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPaymentStatus(s)}
                  className={`rounded-xl border py-3 text-[14px] font-semibold capitalize transition active:scale-[0.98] ${
                    paymentStatus === s
                      ? s === "paid"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-hairline bg-white text-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {confirmActive && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
              <Alert size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[13px] leading-relaxed text-amber-800">
                This customer is already active until{" "}
                <span className="font-semibold">
                  {formatDate(customer.expiryDate)}
                </span>
                . Recharging now resets the expiry from the recharge date. Tap{" "}
                <span className="font-semibold">Save recharge</span> again to
                confirm.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
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
            className={`flex flex-[1.5] items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-60 ${
              confirmActive ? "bg-amber-500" : "bg-brand-500"
            }`}
          >
            {saving ? (
              <>
                <Spinner size={18} /> Saving…
              </>
            ) : (
              <>
                <Check size={18} strokeWidth={2.25} />{" "}
                {confirmActive ? "Confirm recharge" : "Save recharge"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
