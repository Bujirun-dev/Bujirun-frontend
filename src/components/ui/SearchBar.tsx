"use client";

import searchIcon from "@/assets/icons/collection/search.png";
import { cn } from "@/shared/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  gapClassName?: string;
  iconSize?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "관광지 검색",
  className,
  inputClassName,
  gapClassName,
  iconSize = 16,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        gapClassName,
        "py-2 px-3 rounded-lg",
        "bg-system-searchbg",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="shrink-0 bg-sub-gray"
        style={{
          width: iconSize,
          height: iconSize,
          maskImage: `url(${searchIcon.src})`,
          maskSize: "contain",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          WebkitMaskImage: `url(${searchIcon.src})`,
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent outline-none",
          "font-normal text-xs text-text-primary",
          "placeholder:text-sub-gray",
          inputClassName,
        )}
      />
    </div>
  );
}
