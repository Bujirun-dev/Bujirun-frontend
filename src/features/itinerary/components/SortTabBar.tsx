"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import type { Category } from "@/components";

export type SortType = "recommended" | "alphabetical";
export type CategoryFilter = Category | "all";

interface SortTabBarProps {
  sortType?: SortType;
  onSortChange?: (sort: SortType) => void;
  selectedCategory?: CategoryFilter;
  onCategoryChange?: (category: CategoryFilter) => void;
  className?: string;
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string; emoji: string }[] = [
  { value: "all",        label: "전체", emoji: "☆" },
  { value: "sea",        label: "바다", emoji: "🌊" },
  { value: "nature",     label: "자연", emoji: "🌿" },
  { value: "culture",    label: "문화", emoji: "🏛" },
  { value: "experience", label: "체험", emoji: "🎭" },
];

export function SortTabBar({
  sortType = "recommended",
  onSortChange,
  selectedCategory = "all",
  onCategoryChange,
  className,
}: SortTabBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedOption = CATEGORY_OPTIONS.find((o) => o.value === selectedCategory) ?? CATEGORY_OPTIONS[0];

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center gap-4 flex-1">
        <button onClick={() => onSortChange?.("recommended")}>
          <span className={cn(
            "font-paperlogy text-[12px]",
            sortType === "recommended"
              ? "font-bold text-main-blue underline underline-offset-2"
              : "text-sub-gray"
          )}>
            추천순
          </span>
        </button>
        <button onClick={() => onSortChange?.("alphabetical")}>
          <span className={cn(
            "font-paperlogy text-[12px]",
            sortType === "alphabetical"
              ? "font-bold text-main-blue underline underline-offset-2"
              : "text-sub-gray"
          )}>
            이름순
          </span>
        </button>
      </div>

      <div className="relative">
        <button
          className="flex items-center gap-1 border border-sub-lightgray rounded-[8px] px-2.5 py-1"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span className="font-paperlogy text-[11px] text-text-primary">{selectedOption.label}</span>
          <span className="font-paperlogy text-[9px] text-sub-gray">▼</span>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-[12px] shadow-lg z-20 py-1 min-w-[90px]">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className="w-full flex items-center gap-2 px-3 py-2"
                  onClick={() => { onCategoryChange?.(opt.value); setDropdownOpen(false); }}
                >
                  <span className="text-[13px]">{opt.emoji}</span>
                  <span className={cn(
                    "font-paperlogy text-[12px]",
                    opt.value === selectedCategory ? "font-bold text-main-blue" : "text-text-primary"
                  )}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
