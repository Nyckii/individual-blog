"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Walkthrough", short: "1" },
  { href: "/build-circuit", label: "Build Circuit", short: "2" },
  { href: "/attacker", label: "Attacker", short: "3" },
  { href: "/response", label: "Response", short: "4" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`group relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              active
                ? "bg-violet-600 text-white shadow-md"
                : "bg-gray-100 text-gray-400 hover:bg-violet-100 hover:text-violet-600"
            }`}
          >
            {item.short}
            <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
