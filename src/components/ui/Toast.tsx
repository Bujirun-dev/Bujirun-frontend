"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  const appRoot = typeof document === "undefined" ? null : document.getElementById("app-root");

  const toast = (
    <div className="absolute bottom-[94px] left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex h-[28px] items-center justify-center gap-1 rounded-lg bg-sub-darkgray px-3 py-1.5",
          className,
        )}
      >
        {icon}
        <span className="whitespace-nowrap text-sm font-medium text-white">{message}</span>
      </div>
    </div>
  );

  if (!appRoot) return toast;

  return createPortal(toast, appRoot);
}
