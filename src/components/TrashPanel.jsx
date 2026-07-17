import { useEffect, useState } from "react";
import { X, Restore, Trash, Spinner, User } from "./icons";

function timeAgo(iso) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function TrashPanel({
  items,
  loading,
  busyId,
  bulkBusy,
  onClose,
  onRestore,
  onPurge,
  onRestoreAll,
  onPurgeAll,
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-surface/95 px-4 py-3 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-ink">
            Recently deleted
          </h2>
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
            <div className="flex flex-col items-center py-14 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-muted shadow-card">
                <Trash size={24} />
              </div>
              <p className="font-display font-bold text-ink">Nothing deleted</p>
              <p className="mt-1 max-w-[16rem] text-sm text-muted">
                Deleted customers appear here and can be restored.
              </p>
            </div>
          ) : (
            <>
              {/* Bulk actions — only shown when there's something to act on */}
              <div className="mb-3 flex gap-2">
                <button
                  onClick={onRestoreAll}
                  disabled={bulkBusy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hairline bg-white py-2.5 text-[13px] font-semibold text-ink transition hover:border-brand-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {bulkBusy === "restore" ? (
                    <Spinner size={15} />
                  ) : (
                    <Restore size={15} />
                  )}
                  Restore all
                </button>
                <button
                  onClick={onPurgeAll}
                  disabled={bulkBusy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {bulkBusy === "purge" ? (
                    <Spinner size={15} />
                  ) : (
                    <Trash size={15} />
                  )}
                  Delete all
                </button>
              </div>

              <ul className="space-y-2">
                {items.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-2xl border border-hairline bg-white p-3.5 shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-muted">
                        <User size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">
                          {c.name}
                        </p>
                        <p className="truncate text-[13px] text-muted">
                          {c.marathiName} · {c.contact}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted/80">
                          Deleted {timeAgo(c.deletedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => onRestore(c)}
                        disabled={busyId === c.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink min-h-[44px] py-2.5 text-[13px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                      >
                        {busyId === c.id ? (
                          <Spinner size={15} />
                        ) : (
                          <Restore size={15} />
                        )}{" "}
                        Restore
                      </button>
                      <button
                        onClick={() => onPurge(c)}
                        disabled={busyId === c.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white min-h-[44px] py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Trash size={15} /> Delete forever
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
