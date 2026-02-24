"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CloudSun, Activity, ShoppingCart, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils/formatters";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/illness", label: "Illness", icon: Activity },
  { href: "/competitor-ads", label: "Competitor Ads", icon: ShoppingCart },
  { href: "/tetris", label: "Tetris", icon: Gamepad2 },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-1.5 px-3 md:px-5 py-2.5",
                  "text-xs md:text-sm font-medium whitespace-nowrap transition-colors",
                  "border-b-2 -mb-px",
                  isActive
                    ? "border-molly-red text-molly-red"
                    : "border-transparent text-molly-slate hover:text-molly-ink hover:border-slate-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
