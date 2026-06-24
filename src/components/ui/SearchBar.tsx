"use client";

import Image from "next/image";
import searchIcon from "@/assets/icons/collection/search.png";
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
        "flex items-center gap-1",
        "py-2 px-3 rounded-[10px]",
        "bg-system-searchbg",
        className
      )}
    >
      <Image src={searchIcon} alt="검색" width={16} height={16} className="shrink-0" />
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
