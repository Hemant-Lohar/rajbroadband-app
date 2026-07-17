import { Search, Clock, Rupee } from "./icons";

const TABS = [
  { key: "search", label: "Search", Icon: Search },
  { key: "expiring", label: "Expiring", Icon: Clock },
  { key: "pending", label: "Pending", Icon: Rupee },
];

// Mobile: fixed bottom bar. Desktop: inline segmented control (rendered
// by passing variant="segmented").
export default function Tabs({
  active,
  onChange,
  counts = {},
  variant = "bar",
}) {
  if (variant === "segmented") {
    const activeIndex = Math.max(
      0,
      TABS.findIndex((t) => t.key === active),
    );
    return (
      <div className="relative mb-3 flex rounded-xl border border-hairline bg-white p-1 shadow-card">
        {/* The pill slides between three equal cells. Positioned by thirds so
            it lands exactly under the active tab regardless of content width. */}
        <span
          className="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-surface shadow-sm transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            left: `calc(0.25rem + ${activeIndex} * ((100% - 0.5rem) / 3))`,
          }}
        />
        {TABS.map(({ key, label, Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                on ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} className={on ? "text-brand-500" : ""} />
              {label}
              {counts[key] > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 text-[11px] text-brand-700">
                  {counts[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-lg px-2 pt-1.5">
        {TABS.map(({ key, label, Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {/* Icon sits inside a pill that fills with brand tint when active */}
              <span
                className={`relative grid h-8 w-16 place-items-center rounded-full transition-colors duration-200 ${
                  on ? "bg-brand-100" : "bg-transparent"
                }`}
              >
                <Icon
                  size={21}
                  className={on ? "text-brand-600" : "text-muted"}
                />
                {counts[key] > 0 && (
                  <span className="absolute right-2 top-0 grid h-4 min-w-[16px] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {counts[key] > 99 ? "99+" : counts[key]}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] font-medium ${on ? "text-brand-700" : "text-muted"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
