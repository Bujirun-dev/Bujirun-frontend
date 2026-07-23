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
  // "error"면 실패/유효성 검사 실패 등을 나타내는 색으로 바뀐다. 기본은 기존과 동일.
  variant?: "default" | "error";
}

export function Toast({
  isVisible,
  message,
  onHide,
  icon,
  duration = 2500,
  className,
  variant = "default",
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
          "flex h-[28px] items-center justify-center gap-1.5 rounded-lg px-3",
          variant === "error" ? "bg-sub-coral" : "bg-sub-darkgray",
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
