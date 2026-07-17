import { useEffect } from "react";
import { Check } from "./icons";

export default function Toast({ message, onDone, duration = 1600 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-slide-up">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500">
          <Check size={13} className="text-white" strokeWidth={2.5} />
        </span>
        {message}
      </div>
    </div>
  );
}
