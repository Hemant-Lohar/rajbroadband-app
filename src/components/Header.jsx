import { useState, useRef, useEffect } from "react";
import { BRAND } from "../config";
import { More, LogOut, Refresh, Trash, Plus } from "./icons";

// Green when live from the database, red when running off the cached list.
function StatusDot({ live }) {
  return (
    <span
      className="inline-flex items-center"
      title={live ? "Live" : "Offline"}
    >
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:hidden" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            live ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </span>
    </span>
  );
}

export default function Header({
  total,
  live,
  refreshing,
  onRefresh,
  onTrash,
  onSignOut,
  onAdd,
  canEdit,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const iconBtn =
    "grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-white hover:text-ink active:scale-90 disabled:opacity-40 disabled:hover:bg-transparent";
  const menuItem =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface disabled:opacity-40";

  return (
    <header className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5">
        <img
          src="/brand/logo-mark.png"
          alt=""
          className="h-9 w-auto"
          draggable="false"
        />
        <div className="leading-tight">
          <h1 className="font-display text-[17px] font-extrabold tracking-tight text-ink">
            {BRAND.name}
          </h1>
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="tabular">{total} customers</span>
            <StatusDot live={live} />
            <span className={live ? "text-green-700" : "text-red-600"}>
              {live ? "Online" : "Offline"}
            </span>
          </p>
        </div>
      </div>

      {/* Desktop: visible icon buttons + Add */}
      <div className="hidden items-center gap-1 sm:flex">
        <button
          onClick={onRefresh}
          disabled={!live || refreshing}
          className={iconBtn}
          title="Refresh list"
          aria-label="Refresh list"
        >
          <Refresh
            size={19}
            className={refreshing ? "animate-spin-slow" : ""}
          />
        </button>
        <button
          onClick={onTrash}
          disabled={!live}
          className={iconBtn}
          title="Recently deleted"
          aria-label="Recently deleted"
        >
          <Trash size={19} />
        </button>
        <button
          onClick={onSignOut}
          className={iconBtn}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={19} />
        </button>

        {canEdit && (
          <button
            onClick={onAdd}
            className="ml-2 flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform active:scale-95"
          >
            <Plus size={17} strokeWidth={2.5} /> Add customer
          </button>
        )}
      </div>

      {/* Mobile: overflow menu */}
      <div className="relative sm:hidden" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-white active:scale-90"
          aria-label="Menu"
        >
          <More size={20} />
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-hairline bg-white py-1.5 shadow-pop animate-slide-up">
            <button
              className={menuItem}
              disabled={!live || refreshing}
              onClick={() => {
                setOpen(false);
                onRefresh();
              }}
            >
              <Refresh size={17} className="text-muted" /> Refresh list
            </button>
            <button
              className={menuItem}
              disabled={!live}
              onClick={() => {
                setOpen(false);
                onTrash();
              }}
            >
              <Trash size={17} className="text-muted" /> Recently deleted
            </button>
            <div className="my-1 border-t border-hairline" />
            <button
              className={`${menuItem} text-red-600`}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
