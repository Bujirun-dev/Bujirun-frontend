"use client";

import { BookOpen, CalendarDays, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/shared/constants/navigation";

const navIcons = {
  "/": Home,
  "/schedule": CalendarDays,
  "/dogam": BookOpen,
  "/mypage": UserRound,
};

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[402px] border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="grid h-16 grid-cols-4 px-2">
        {navigationItems.map((item) => {
          const Icon = navIcons[item.href];
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={2.25}
                className={isActive ? "text-foreground" : "text-muted"}
              />
              <span className={isActive ? "text-foreground" : "text-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
