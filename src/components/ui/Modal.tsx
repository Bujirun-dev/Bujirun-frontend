"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "warning";
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  childrenClassName?: string;
  childrenVariant?: "card" | "plain";
  footer?: React.ReactNode;
  hideActions?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  children,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  className,
  iconClassName,
  titleClassName,
  childrenClassName,
  childrenVariant = "card",
  footer,
  hideActions = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  const appRoot = document.getElementById("app-root");
  if (!appRoot) return null;

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return createPortal(
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-5 py-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-[343px] max-h-[80dvh] overflow-y-auto overflow-x-hidden bg-white rounded-3xl px-8 py-10 flex flex-col items-center gap-6",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div
            className={cn(
              "w-[48px] h-[48px] rounded-full bg-system-navbg flex items-center justify-center text-2xl",
              iconClassName,
            )}
          >
            {icon}
          </div>
        )}

        {(title || description) && (
          <div className="flex flex-col items-center gap-5 text-center">
            {title && (
              <h2
                className={cn(
                  "font-ssurround text-xl font-bold text-text-heading",
                  titleClassName,
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="font-paperlogy text-lg font-semibold text-text-primary leading-relaxed whitespace-pre-line">
                {description}
              </p>
            )}
          </div>
        )}

        {children &&
          (childrenVariant === "card" ? (
            <Card
              variant="glass-sm"
              className={cn(
                "w-full rounded-lg px-3 py-2 flex flex-col gap-2 justify-center",
                childrenClassName,
              )}
            >
              {children}
            </Card>
          ) : (
            <div className={cn("w-full", childrenClassName)}>{children}</div>
          ))}

        {footer}

        {!hideActions && (
          <div className="mt-1 flex w-full justify-center gap-6">
            <button
              className={cn(
                "h-[40px] w-[125px] rounded-lg border font-ssurround text-md font-bold active:opacity-70",
                confirmVariant === "warning"
                  ? "border-sub-coral text-sub-coral"
                  : "border-main-blue text-sub-deepblue",
              )}
              onClick={handleCancel}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                className={cn(
                  "h-[40px] w-[125px] rounded-lg font-ssurround text-md font-bold text-white active:opacity-70",
                  confirmVariant === "warning" ? "bg-sub-coral" : "bg-main-blue",
                )}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    appRoot,
  );
}
