/**
 * SVG Icon component — replaces all emoji usage across the app.
 * All paths use a 24×24 viewBox, stroke-based (currentColor).
 */

const PATHS = {
  gamepad: (
    <>
      <rect x="2" y="7" width="20" height="13" rx="5" />
      <path d="M6 13h4M8 11v4" />
      <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  x: <path d="M18 6L6 18M6 6l12 12" />,
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </>
  ),
  refresh: (
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  ),
  package: (
    <>
      <path d="M21 16V8a2 2 0 00-1-1.73L13 2.27a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L11 21.73a2 2 0 002 0L20 17.73A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </>
  ),
  palette: (
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7v1c0 .55.45 1 1 1s1-.45 1-1v-1C22 6.48 17.52 2 12 2z" />
    </>
  ),
  pencil: (
    <>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </>
  ),
  antenna: (
    <>
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="20"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4h5M12 15v5s3.03-.55 4-2v-5" />
    </>
  ),
  brain: (
    <path d="M9 4a4 4 0 00-4 4v1a2 2 0 000 4v1a4 4 0 004 4h6a4 4 0 004-4v-1a2 2 0 000-4V8a4 4 0 00-4-4H9zM9 8h6M9 12h6M9 16h4" />
  ),
  volcano: (
    <>
      <path d="M8 20l4-8 4 8" />
      <path d="M2 20l5-11 3 3 2-3 3 3 5-11" />
      <path d="M10 8c0-2 .5-4 2-4s2 2 2 4" />
    </>
  ),
  lightning: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  "folder-tabs": (
    <>
      <path d="M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" />
      <path d="M14 7V5a2 2 0 00-2-2h-2" />
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  plug: (
    <>
      <path d="M12 22v-5" />
      <path d="M9 8V2M15 8V2" />
      <path d="M6 8h12a2 2 0 012 2v3a6 6 0 01-12 0v-3a2 2 0 012-2z" />
    </>
  ),
  robot: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M12 11V5M8 5h8" />
      <circle cx="8.5" cy="16.5" r="1.5" />
      <circle cx="15.5" cy="16.5" r="1.5" />
      <path d="M9.5 20.5h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  seedling: (
    <>
      <path d="M12 22V11" />
      <path d="M5 11l7-9 7 9" />
      <path d="M5 11H2a10 10 0 0010 10" />
    </>
  ),
  banana: (
    <path d="M4 12C4 7 8 3 13 3c3 0 5 1 7 3-2-1-4-1-6-1-5 0-9 3-9 8 0 3 2 6 5 7-4-1-6-4-6-8z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  bear: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="6.5" cy="7.5" r="2.5" />
      <circle cx="17.5" cy="7.5" r="2.5" />
      <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M10 17c.7.6 1.3.9 2 .9s1.3-.3 2-.9" />
    </>
  ),
  alien: (
    <>
      <ellipse cx="12" cy="13" rx="7" ry="6" />
      <path d="M5 13C3 13 2 11 2 9a5 5 0 015-5" />
      <path d="M19 13c2 0 3-2 3-4a5 5 0 00-5-5" />
      <path d="M9 15l-2 2M15 15l2 2M9 12h6" />
    </>
  ),
  ruler: (
    <>
      <path d="M5 3l14 18M5 3l6 8M5 3L3 9" />
      <path d="M19 21l-6-8M19 21l2-6" />
    </>
  ),
  city: (
    <>
      <path d="M3 21h18" />
      <path d="M9 3v18M15 3v18" />
      <rect x="3" y="8" width="6" height="13" />
      <rect x="9" y="5" width="6" height="16" />
      <rect x="15" y="10" width="6" height="11" />
      <path d="M5 8V5h4V8M11 5V2h4v3M17 10V7h4v3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  weapon: (
    <>
      <path d="M6 12h8l2-4h2v4l-2 4H6V12z" />
      <path d="M10 12v4" />
      <path d="M4 12H6" />
    </>
  ),
  phone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      <path d="M9 6h6" />
    </>
  ),
  folder: (
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  ),
  "folder-open": (
    <>
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v3" />
      <path d="M2 13h20l-2 8H4L2 13z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line
        x1="12"
        y1="8"
        x2="12"
        y2="8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 11v5" />
    </>
  ),
  chair: (
    <>
      <path d="M5 18v-7a7 7 0 0114 0v7" />
      <path d="M3 18h18" />
      <path d="M9 18v3M15 18v3" />
    </>
  ),
};

export function Icon({ name, size = 16, style, className }) {
  const content = PATHS[name] ?? null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
