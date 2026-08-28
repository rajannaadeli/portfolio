import type { SVGProps } from "react";

/*
  Service icons — authored line icons (not an icon library). 1.5px stroke,
  geometric, single-color via currentColor so each takes the card's accent
  (design/Phase 2 §2.5). 24×24, round caps/joins, no fill.
*/

const base: SVGProps<SVGSVGElement> = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Rostering — calendar grid with a filled slot
export function IconRostering(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 3v3M16 3v3M9 13h6M9 17h4" />
      <rect x="14.5" y="11.5" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// GPS time & attendance — map pin with a clock
export function IconGps(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21c4-4.5 6.5-7.7 6.5-11a6.5 6.5 0 1 0-13 0c0 3.3 2.5 6.5 6.5 11Z" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M12 8.4V10l1.3.9" />
    </svg>
  );
}

// Compliance — shield with a check
export function IconCompliance(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5v-5L12 3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

// Multi-tenant SaaS — layered buildings
export function IconMultiTenant(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M4 21V9l6-3v15M14 21V11l6-3v13M2 21h20" />
      <path d="M7 11v0M7 14v0M7 17v0M17 13v0M17 16v0" />
    </svg>
  );
}

// React Native field apps — phone with signal
export function IconFieldApps(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M10.5 18h3" />
      <path d="M9.5 9.2a3.2 3.2 0 0 1 5 0M11 11.2a1.3 1.3 0 0 1 2 0" />
    </svg>
  );
}

// Realtime dashboards — pulse panel
export function IconRealtime(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M6 13.5l2.5-3 2 2.5L13 8l2 4h3" />
    </svg>
  );
}
