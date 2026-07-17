import { useRef } from "react";
import { Search, X } from "./icons";

export default function SearchBar({ value, onChange, resultCount, hasQuery }) {
  const ref = useRef(null);

  return (
    <div className="sticky top-0 z-20 bg-surface/90 pb-2 pt-2 backdrop-blur-md sm:pt-3">
      <div className="flex items-center gap-2.5 rounded-2xl border border-hairline bg-white px-4 shadow-card focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-colors">
        <Search size={19} className="shrink-0 text-muted" />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search name, नाव, username or number"
          className="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-muted/70 sm:text-[15px]"
        />
        {hasQuery && (
          <button
            onClick={() => {
              onChange("");
              ref.current?.focus();
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface active:scale-90"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {hasQuery && (
        <p className="px-2 pt-2 text-xs text-muted tabular">
          {resultCount === 0
            ? "No matches"
            : `${resultCount} ${resultCount === 1 ? "result" : "results"}`}
        </p>
      )}
    </div>
  );
}
