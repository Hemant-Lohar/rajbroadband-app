import {
  statusOf,
  daysUntil,
  formatDate,
  EXPIRING_SOON_DAYS,
} from "../lib/subscription";
import { BRAND } from "../config";
import { Clock, Whatsapp, Phone, User } from "./icons";

function whatsappLink(contact) {
  const d = String(contact || "").replace(/\D/g, "");
  const num = d.length === 10 ? BRAND.countryCode + d : d;
  return `https://wa.me/${num}`;
}

function ExpiryRow({ customer, planName, onSelect }) {
  const d = daysUntil(customer.expiryDate);
  const st = statusOf(customer);
  const digits = String(customer.contact || "").replace(/\D/g, "");

  let when;
  if (d < 0) when = `expired ${Math.abs(d)}d ago`;
  else if (d === 0) when = "expires today";
  else if (d === 1) when = "expires tomorrow";
  else when = `in ${d} days`;

  return (
    <li className="rounded-2xl border border-hairline bg-white p-3.5 shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelect(customer)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface"
            style={{ color: st.dot }}
          >
            <User size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">
              {customer.name}
            </span>
            <span className="block truncate text-[12.5px] text-muted">
              {planName || "No plan"} ·{" "}
              <span style={{ color: st.text }}>{when}</span>
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={`tel:${digits}`}
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-brand-600 active:scale-90"
            aria-label="Call"
          >
            <Phone size={17} />
          </a>
          <a
            href={whatsappLink(customer.contact)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full text-whatsapp transition hover:bg-green-50 active:scale-90"
            aria-label="WhatsApp"
          >
            <Whatsapp size={18} />
          </a>
        </div>
      </div>
    </li>
  );
}

export default function ExpiringView({ customers, planName, onSelect }) {
  // Everyone expiring within the window OR already expired, soonest first.
  const rows = customers
    .filter((c) => {
      if (c.manualStatus === "suspended" || !c.planId || !c.expiryDate)
        return false;
      const d = daysUntil(c.expiryDate);
      return d !== null && d <= EXPIRING_SOON_DAYS;
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const expiringSoon = rows.filter((c) => daysUntil(c.expiryDate) >= 0);
  const expired = rows.filter((c) => daysUntil(c.expiryDate) < 0);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 pt-20 text-center animate-fade-in">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand-500 shadow-card">
          <Clock size={26} />
        </div>
        <h2 className="font-display text-lg font-bold text-ink">All clear</h2>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          No customers expiring in the next {EXPIRING_SOON_DAYS} days.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-3 sm:pb-6">
      {expiringSoon.length > 0 && (
        <>
          <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Expiring soon · {expiringSoon.length}
          </h3>
          <ul className="mb-5 space-y-2">
            {expiringSoon.map((c) => (
              <ExpiryRow
                key={c.id}
                customer={c}
                planName={planName(c)}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </>
      )}
      {expired.length > 0 && (
        <>
          <h3 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Already expired · {expired.length}
          </h3>
          <ul className="space-y-2">
            {expired.map((c) => (
              <ExpiryRow
                key={c.id}
                customer={c}
                planName={planName(c)}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
