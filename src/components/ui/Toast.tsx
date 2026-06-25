"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils";

interface ToastProps {
  isVisible: boolean;
  message: string;
  onHide: () => void;
  icon?: React.ReactNode;
  duration?: number;
  className?: string;
}

export function Toast({
  isVisible,
  message,
  onHide,
  icon,
  duration = 2500,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [duration, isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[94px] left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex h-[28px] w-[155px] items-center justify-center gap-2 rounded-[10px] bg-sub-darkgray px-[18px] py-[6px]",
          className,
        )}
      >
        {icon}
        <span className="whitespace-nowrap font-paperlogy text-[12px] font-medium text-white">
          {message}
        </span>
      </div>
    </div>
  );
}
