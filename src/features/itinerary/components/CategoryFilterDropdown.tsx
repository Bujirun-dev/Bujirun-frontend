"use client";

import { useState } from "react";
import Image from "next/image";
import triangleIcon from "@/assets/icons/itinerary/triangle.png";
import { cn } from "@/shared/utils";
import { CATEGORY_LABEL } from "@/shared/constants/category";
import type { Category } from "@/components";

type CategoryFilter = Category | "all";

const CATEGORY_EMOJI: Record<string, string> = {
  all: "⭐",
  sea: "🌊",
  nature: "🌿",
  culture: "🏛",
  experience: "🎡",
};

const CATEGORY_OPTIONS: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "all" },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
    label: label.replace("#", ""),
    value: value as Category,
  })),
];

interface CategoryFilterDropdownProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

export function CategoryFilterDropdown({ value, onChange }: CategoryFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[19px] items-center gap-3.5 rounded-[7px] bg-system-navbg pl-[15px] pr-1.5 font-paperlogy text-xs font-normal text-text-primary"
        style={{ border: "0.5px solid var(--color-main-blue)" }}
      >
        {CATEGORY_OPTIONS.find((c) => c.value === value)?.label ?? "전체"}
        <Image
          src={triangleIcon}
          alt="드롭다운"
          width={6}
          height={6}
          className={cn("shrink-0 transition-transform rotate-180", open && "!rotate-0")}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[22px] z-20 w-full overflow-hidden rounded-lg bg-white py-[5px] px-[3px] shadow-md"
          style={{ border: "0.5px solid var(--color-main-blue)" }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-1.5 whitespace-nowrap px-2 py-[3px] text-left font-paperlogy text-xs text-text-primary",
                value === opt.value && "rounded-[5px] bg-system-navbg font-semibold",
              )}
              style={value === opt.value ? { border: "0.5px solid var(--color-main-blue)" } : undefined}
            >
              <span>{CATEGORY_EMOJI[opt.value]}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
