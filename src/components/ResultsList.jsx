import { highlight } from "../lib/search";
import { User } from "./icons";
import StatusDot from "./StatusDot";

function Highlighted({ text, query }) {
  const parts = highlight(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded bg-brand-100 px-0.5 text-brand-800">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export default function ResultsList({ results, query, selectedId, onSelect }) {
  return (
    <ul className="space-y-2 pb-32 sm:pb-6">
      {results.map((c, idx) => {
        const active = c.id === selectedId;
        return (
          <li
            key={c.id}
            className="animate-slide-up"
            style={{
              animationDelay: `${Math.min(idx * 18, 180)}ms`,
              animationFillMode: "backwards",
            }}
          >
            <button
              onClick={() => onSelect(c)}
              className={`group flex w-full items-center gap-3.5 rounded-2xl border bg-white p-3.5 text-left shadow-card transition-all active:scale-[0.99] ${
                active
                  ? "border-brand-500 ring-2 ring-brand-100"
                  : "border-hairline hover:border-brand-200"
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                    active
                      ? "bg-brand-500 text-white"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <User size={20} />
                </div>
                <span className="absolute -right-1 -top-1">
                  <StatusDot customer={c} size={11} ping />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  <Highlighted text={c.name} query={query} />
                </p>
                <p className="truncate text-[13.5px] text-muted">
                  <Highlighted text={c.marathiName} query={query} />
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="max-w-[120px] truncate text-[13px] font-medium text-brand-600">
                  <Highlighted text={c.username} query={query} />
                </p>
                <p className="tabular text-xs text-muted">
                  <Highlighted text={c.contact} query={query} />
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
