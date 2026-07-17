import { useRegisterSW } from "virtual:pwa-register/react";
import { Refresh } from "./icons";

// Installed PWAs cache aggressively. Without this, staff can sit on an old
// version for days after a deploy. This tells them a new one is ready.
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.error("Service worker registration failed:", err);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pt-2">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-pop animate-slide-up">
        <Refresh size={18} className="shrink-0 text-brand-400" />
        <p className="flex-1 text-[13px] font-medium">
          A new version is ready.
        </p>
        <button
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 rounded-xl bg-brand-500 px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95"
        >
          Reload
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="shrink-0 px-1 text-[13px] font-medium text-white/60 transition hover:text-white"
        >
          Later
        </button>
      </div>
    </div>
  );
}
