"use client";

import { cn } from "@/shared/utils";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function Counter({ value, onChange, min = 1, max = 99, className }: CounterProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "w-[32px] h-[32px] rounded-full border-2 border-main-blue",
          "flex items-center justify-center",
          "font-paperlogy font-bold text-[18px] text-sub-deepblue",
          "transition-opacity disabled:opacity-30"
        )}
      >
        −
      </button>
      <span className="font-paperlogy font-bold text-[18px] text-text-heading w-[24px] text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "w-[32px] h-[32px] rounded-full border-2 border-main-blue",
          "flex items-center justify-center",
          "font-paperlogy font-bold text-[18px] text-sub-deepblue",
          "transition-opacity disabled:opacity-30"
        )}
      >
        +
      </button>
    </div>
  );
}
