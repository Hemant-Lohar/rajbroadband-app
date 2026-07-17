// Minimal inline icon set (stroke-based, currentColor).
export function Icon({
  path,
  size = 20,
  className = "",
  strokeWidth = 1.75,
  fill = "none",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export const Search = (p) => (
  <Icon
    {...p}
    path={
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    }
  />
);
export const Phone = (p) => (
  <Icon
    {...p}
    path={
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    }
  />
);
export const Copy = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    }
  />
);
export const Check = (p) => <Icon {...p} path={<path d="M20 6 9 17l-5-5" />} />;
export const Plus = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    }
  />
);
export const Edit = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </>
    }
  />
);
export const Trash = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    }
  />
);
export const X = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    }
  />
);
export const Back = (p) => <Icon {...p} path={<path d="m15 18-6-6 6-6" />} />;
export const User = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    }
  />
);
export const Lock = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    }
  />
);
export const Download = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </>
    }
  />
);
export const Upload = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
      </>
    }
  />
);
export const More = (p) => (
  <Icon
    {...p}
    path={
      <>
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
      </>
    }
  />
);
export const WifiOff = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="m2 2 20 20" />
        <path d="M8.5 16.5a5 5 0 0 1 7 0" />
        <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
        <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
        <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
        <path d="M5 13a10 10 0 0 1 5.24-2.76" />
        <path d="M12 20h.01" />
      </>
    }
  />
);
export const Refresh = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </>
    }
  />
);
export const LogOut = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    }
  />
);
export const Restore = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </>
    }
  />
);
export const TrashPanel = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    }
  />
);
export const Alert = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="9" />
      </>
    }
  />
);
export const Bolt = (p) => (
  <Icon {...p} path={<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />} />
);
export const Clock = (p) => (
  <Icon
    {...p}
    path={
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    }
  />
);
export const Rupee = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l8.5 8" />
        <path d="M6 13h3a5 5 0 0 0 0-10" />
      </>
    }
  />
);
export const Calendar = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </>
    }
  />
);
export const Pause = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </>
    }
  />
);
export const ChevRight = (p) => (
  <Icon {...p} path={<path d="m9 18 6-6-6-6" />} />
);
export const Eye = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);
export const EyeOff = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.4" />
        <path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.4-1.4" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="m2 2 20 20" />
      </>
    }
  />
);
export const Sparkle = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="m6.3 6.3 2.4 2.4" />
        <path d="m15.3 15.3 2.4 2.4" />
        <path d="m17.7 6.3-2.4 2.4" />
        <path d="m8.7 15.3-2.4 2.4" />
      </>
    }
  />
);
export const Spinner = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`animate-spin-slow ${className}`}
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
export const Whatsapp = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.24.25-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.47-.01a.9.9 0 0 0-.65.31c-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);
export const Signal = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="14" width="3.4" height="7" rx="1.2" opacity="0.55" />
    <rect x="8.3" y="9.5" width="3.4" height="11.5" rx="1.2" opacity="0.75" />
    <rect x="13.6" y="5" width="3.4" height="16" rx="1.2" opacity="0.9" />
    <rect x="18.9" y="2" width="2.1" height="2.1" rx="1" />
  </svg>
);
