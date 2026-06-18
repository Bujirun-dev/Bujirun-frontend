"use client";

import { cn } from "@/shared/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "관광지 검색",
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "h-[30px] px-4 rounded-[10px]",
        "bg-system-searchbg",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 text-sub-gray"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent outline-none",
          "font-paperlogy font-normal text-xs text-text-primary",
          "placeholder:text-sub-gray"
        )}
      />
    </div>
  );
}
