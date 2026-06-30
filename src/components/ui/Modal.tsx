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
  hideCloseButton?: boolean;
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
  hideCloseButton = false,
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
          "relative w-full max-w-[320px] max-h-[80dvh] overflow-y-auto overflow-x-hidden bg-white rounded-3xl px-7 py-9 flex flex-col items-center gap-8",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* x 버튼 — hideCloseButton prop으로 숨길 수 있음 */}
        {!hideCloseButton && (
          <button
            type="button"
            aria-label="닫기"
            className={cn(
              "absolute right-5 top-5 flex h-5 w-5 cursor-pointer items-center justify-center active:opacity-70",
              confirmVariant === "warning" ? "text-sub-coral" : "text-main-blue",
            )}
            onClick={onClose}
          >
            <svg
              viewBox="0 0 512.021 512.021"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

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
          <div className="flex flex-col items-center gap-4 text-center">
            {title && (
              <h2
                className={cn("font-ssurround text-xl font-bold text-text-heading", titleClassName)}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg font-semibold text-text-primary leading-relaxed whitespace-pre-line">
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
            <div className={cn("w-full flex flex-col items-center gap-6", childrenClassName)}>{children}</div>
          ))}

        {footer}

        {!hideActions && (
          <div className="mt-1 flex w-full justify-center gap-6">
            <button
              className={cn(
                "py-2.5 min-w-[100px] px-5 cursor-pointer rounded-lg border font-ssurround text-md font-bold active:opacity-70",
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
                  "py-2.5 min-w-[100px] px-5 cursor-pointer rounded-lg font-ssurround text-md font-bold text-white active:opacity-70",
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
