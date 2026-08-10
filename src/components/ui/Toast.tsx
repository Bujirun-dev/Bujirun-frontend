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
  variant?: "success" | "error" | "warning" | "default";
}

const TOAST_ICONS = {
  success: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="m18.214,9.098c.387.394.381,1.027-.014,1.414l-4.426,4.345c-.783.768-1.791,1.151-2.8,1.151-.998,0-1.996-.376-2.776-1.129l-1.899-1.867c-.394-.387-.399-1.02-.012-1.414.386-.395,1.021-.4,1.414-.012l1.893,1.861c.776.75,2.001.746,2.781-.018l4.425-4.344c.393-.388,1.024-.381,1.414.013Zm5.786,2.902c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-2,0c0-5.514-4.486-10-10-10S2,6.486,2,12s4.486,10,10,10,10-4.486,10-10Z" />
    </svg>
  ),

  error: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M16,8a1,1,0,0,0-1.414,0L12,10.586,9.414,8A1,1,0,0,0,8,9.414L10.586,12,8,14.586A1,1,0,0,0,9.414,16L12,13.414,14.586,16A1,1,0,0,0,16,14.586L13.414,12,16,9.414A1,1,0,0,0,16,8Z" />
      <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z" />
    </svg>
  ),

  warning: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z" />
      <path d="M12,5a1,1,0,0,0-1,1v8a1,1,0,0,0,2,0V6A1,1,0,0,0,12,5Z" />
      <rect x="11" y="17" width="2" height="2" rx="1" />
    </svg>
  ),

  default: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current">
      <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z" />
      <path d="M12,10H11a1,1,0,0,0,0,2h1v6a1,1,0,0,0,2,0V12A2,2,0,0,0,12,10Z" />
      <circle cx="12" cy="6.5" r="1.5" />
    </svg>
  ),
} satisfies Record<NonNullable<ToastProps["variant"]>, React.ReactNode>;

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
    <div className="absolute bottom-[80px] left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex h-[30px] w-[260px] items-center justify-center gap-1.5 rounded-lg px-3",
          {
            success: "bg-toastbg-success border border-toast-success text-toast-success",
            error: "bg-toastbg-error border border-toast-error text-toast-error",
            warning: "bg-toastbg-warning border border-toast-warning text-toast-warning",
            default: "bg-toastbg-default border border-toast-default text-toast-default",
          }[variant],
          className,
        )}
      >
        {icon ?? TOAST_ICONS[variant]}
        <span className="whitespace-nowrap text-sm font-medium">{message}</span>
      </div>
    </div>
  );

  if (!appRoot) return toast;

  return createPortal(toast, appRoot);
}
