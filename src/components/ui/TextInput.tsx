"use client";

import { cn } from "@/shared/utils";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function TextInput({ className, maxLength, value, ...props }: TextInputProps) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full flex flex-col" style={{ gap: 5 }}>
      <input
        value={value}
        maxLength={maxLength}
        className={cn(
          "w-full h-[40px] px-4 rounded-[12px]",
          "bg-white border border-sub-gray",
          "font-paperlogy font-semibold text-[12px] text-sub-darkgray",
          "placeholder:text-sub-gray",
          "outline-none focus:border-main-blue transition-colors",
          className
        )}
        {...props}
      />
      {maxLength && (
        <span className="font-paperlogy font-semibold text-[12px] text-sub-gray pr-[10px] text-right">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
}
