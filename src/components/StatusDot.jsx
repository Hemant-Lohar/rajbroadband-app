import { statusOf, STATUS } from "../lib/subscription";

// Subscription status indicator. Mirrors the header's online/offline dot —
// a soft ping halo on the "live/attention" states, a solid pip underneath.
export default function StatusDot({
  customer,
  size = 10,
  withLabel = false,
  ping = false,
}) {
  const st = customer ? statusOf(customer) : STATUS.none;
  const wantsPing = ping && (st.key === "expiring" || st.key === "expired");

  return (
    <span className="inline-flex items-center gap-1.5" title={st.label}>
      <span className="relative flex" style={{ width: size, height: size }}>
        {wantsPing && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-70 motion-safe:animate-ping motion-reduce:hidden"
            style={{ background: st.dot }}
          />
        )}
        <span
          className="relative inline-flex rounded-full ring-2 ring-white"
          style={{ width: size, height: size, background: st.dot }}
        />
      </span>
      {withLabel && (
        <span className="text-[11px] font-medium" style={{ color: st.text }}>
          {st.label}
        </span>
      )}
      <span className="sr-only">{st.label}</span>
    </span>
  );
}
