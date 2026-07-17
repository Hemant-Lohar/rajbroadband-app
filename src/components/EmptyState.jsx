import { Search } from "./icons";

export default function EmptyState({ mode, total }) {
  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center px-8 pt-16 text-center animate-fade-in">
        <img
          src="/brand/logo-mark.png"
          alt=""
          className="mb-4 h-16 w-auto opacity-90"
          draggable="false"
        />
        <p className="tabular text-[15px] font-medium text-muted">
          {total} customers
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-8 pt-16 text-center animate-fade-in">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white text-muted shadow-card">
        <Search size={26} />
      </div>
      <h2 className="font-display text-lg font-bold text-ink">No matches</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
        Nothing found. Check the spelling, or try the phone number instead.
      </p>
    </div>
  );
}
