import { BRAND } from "../config";
import { Copy, Phone, Whatsapp, Edit, Trash, User } from "./icons";
import PlanBlock from "./PlanBlock";

function Field({ label, value, mono, onCopy }) {
  return (
    <button
      onClick={onCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-left transition-colors hover:border-brand-200 active:bg-surface"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p
          className={`truncate text-[15px] font-semibold text-ink ${mono ? "tabular" : ""}`}
        >
          {value || <span className="font-normal text-muted">—</span>}
        </p>
      </div>
      {value && (
        <span className="shrink-0 rounded-lg p-1.5 text-muted transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
          <Copy size={17} />
        </span>
      )}
    </button>
  );
}

// The inner content — identical on mobile and desktop.
export default function CustomerDetail({
  customer,
  canEdit,
  planName,
  rechargeCount,
  onCopy,
  onEdit,
  onDelete,
  onRecharge,
  onHistory,
  onToggleSuspend,
}) {
  const digits = String(customer.contact || "").replace(/\D/g, "");
  const waNumber = digits.length === 10 ? BRAND.countryCode + digits : digits;
  const canCall = digits.length >= 10;

  return (
    <>
      <div className="flex flex-col items-center pb-6 pt-2 text-center">
        <div className="mb-3 grid h-20 w-20 place-items-center rounded-3xl bg-slate text-white shadow-card">
          <User size={34} />
        </div>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
          {customer.name}
        </h2>
        {customer.marathiName && (
          <p className="mt-0.5 text-[15px] text-muted">
            {customer.marathiName}
          </p>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <a
          href={canCall ? `tel:${digits}` : undefined}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform active:scale-[0.98] ${
            canCall ? "bg-slate" : "pointer-events-none bg-muted/40"
          }`}
        >
          <Phone size={18} /> Call
        </a>
        <a
          href={canCall ? `https://wa.me/${waNumber}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform active:scale-[0.98] ${
            canCall ? "bg-whatsapp" : "pointer-events-none bg-muted/40"
          }`}
        >
          <Whatsapp size={19} /> WhatsApp
        </a>
      </div>

      <PlanBlock
        customer={customer}
        planName={planName}
        rechargeCount={rechargeCount}
        lastRechargeDate={customer.lastRechargeDate}
        canEdit={canEdit}
        onRecharge={onRecharge}
        onHistory={onHistory}
        onToggleSuspend={onToggleSuspend}
      />

      <div className="mt-3 space-y-2">
        <Field
          label="Username"
          value={customer.username}
          onCopy={() => onCopy(customer.username, "Username copied")}
        />
        <Field
          label="Contact"
          value={customer.contact}
          mono
          onCopy={() => onCopy(customer.contact, "Number copied")}
        />
        <Field
          label="Marathi name"
          value={customer.marathiName}
          onCopy={() => onCopy(customer.marathiName, "Name copied")}
        />
      </div>

      {canEdit ? (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hairline bg-white min-h-[44px] py-2.5 text-[13px] font-semibold text-ink transition hover:border-brand-200 active:scale-[0.98]"
          >
            <Edit size={15} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white min-h-[44px] py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
          >
            <Trash size={15} /> Delete
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-muted">
          Offline — viewing only
        </p>
      )}

      <p className="mt-4 text-center text-xs text-muted/70">
        Tap a field to copy · ID {customer.id}
      </p>
    </>
  );
}
