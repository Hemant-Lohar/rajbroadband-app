import { useEffect } from "react";
import CustomerDetail from "./CustomerDetail";
import { Back } from "./icons";

// Mobile-only wrapper: the detail content in a bottom sheet.
// On desktop the same content renders in a side panel instead (see App).
export default function CustomerSheet({
  customer,
  canEdit,
  planName,
  rechargeCount,
  onClose,
  onCopy,
  onEdit,
  onDelete,
  onRecharge,
  onHistory,
  onToggleSuspend,
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
    <div className="fixed inset-0 z-40 flex flex-col justify-end sm:hidden">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop animate-sheet-in">
        {/* grab handle — mobile bottom-sheet affordance */}
        <div className="flex justify-center pb-1 pt-2.5">
          <span className="h-1 w-9 rounded-full bg-hairline" />
        </div>

        <div className="flex shrink-0 items-center px-3 pb-1">
          <button
            onClick={onClose}
            className="flex min-h-[44px] items-center gap-1 rounded-full pl-2 pr-4 text-sm font-medium text-muted transition hover:bg-white active:scale-95"
          >
            <Back size={18} /> Back
          </button>
        </div>

        <div className="pb-safe scroll-thin flex-1 overflow-y-auto px-5 pt-1">
          <CustomerDetail
            customer={customer}
            canEdit={canEdit}
            planName={planName}
            rechargeCount={rechargeCount}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            onRecharge={onRecharge}
            onHistory={onHistory}
            onToggleSuspend={onToggleSuspend}
          />
        </div>
      </div>
    </div>
  );
}
