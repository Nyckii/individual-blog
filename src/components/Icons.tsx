/**
 * SVG icon components replacing emojis throughout the app.
 * Each icon is a simple, color-coded SVG that renders at the given size.
 */

interface IconProps {
  size?: number;
  className?: string;
}

/* ───────── Node icons ───────── */

export function AliceIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="3" width="16" height="12" rx="2" stroke="#6366f1" strokeWidth="2" />
      <line x1="4" y1="18" x2="20" y2="18" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="9" r="2" fill="#6366f1" />
    </svg>
  );
}

export function GuardIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L4 7v4c0 5.25 3.4 10.15 8 11.25C16.6 21.15 20 16.25 20 11V7l-8-4z" stroke="#ef4444" strokeWidth="2" fill="#ef444420" />
      <path d="M9 12l2 2 4-4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiddleIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 8h4l4 4-4 4H4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8h-4l-4 4 4 4h4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExitIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="11" height="18" rx="1" stroke="#3b82f6" strokeWidth="2" />
      <path d="M17 12H21M21 12L18 9M21 12L18 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WebsiteIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="#8b5cf6" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#8b5cf6" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="#8b5cf6" strokeWidth="1.5" />
    </svg>
  );
}

export function IspIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="#f59e0b" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="8" y1="6" x2="8" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  );
}

/* ───────── Status icons ───────── */

export function LockIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DocIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function KeyIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="15" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 9.5L21 3M18 3l3 3M12 12l2.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function DetectiveIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="#dc2626" strokeWidth="2" />
      <line x1="15" y1="15" x2="20" y2="20" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function OnionIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="14" rx="8" ry="7" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e10" />
      <ellipse cx="12" cy="14" rx="5" ry="5" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f610" />
      <ellipse cx="12" cy="14" rx="2.5" ry="3" stroke="#8b5cf6" strokeWidth="1.5" fill="#8b5cf610" />
      <path d="M12 3C12 3 10 6 10 8s1 3 2 4c1-1 2-2 2-4s-2-5-2-5z" fill="#22c55e" opacity="0.6" />
    </svg>
  );
}

/* ───────── Relay pool icons (colored circles with letter) ───────── */

const RELAY_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#ef4444", "#eab308", "#92400e"];

export function RelayIcon({ index, size = 20, className }: IconProps & { index: number }) {
  const color = RELAY_COLORS[index % RELAY_COLORS.length];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" fill={color + "25"} stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

/* ───────── Website destination icons ───────── */

export function BookIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 4h6a2 2 0 012 2v14a1 1 0 01-1-1H4V4z" stroke="#3b82f6" strokeWidth="2" />
      <path d="M20 4h-6a2 2 0 00-2 2v14a1 1 0 011-1h7V4z" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

export function NewsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#64748b" strokeWidth="2" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="12" x2="13" y2="12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="16" x2="15" y2="16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#8b5cf6" strokeWidth="2" />
      <path d="M3 7l9 6 9-6" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── Mapping helpers ───────── */

/** Returns the appropriate SVG icon for a network node ID */
export function NodeIcon({ nodeId, size = 20, className }: IconProps & { nodeId: string }) {
  switch (nodeId) {
    case "alice": return <AliceIcon size={size} className={className} />;
    case "guard": return <GuardIcon size={size} className={className} />;
    case "middle": return <MiddleIcon size={size} className={className} />;
    case "exit": return <ExitIcon size={size} className={className} />;
    case "website": return <WebsiteIcon size={size} className={className} />;
    case "isp": return <IspIcon size={size} className={className} />;
    default: return null;
  }
}
