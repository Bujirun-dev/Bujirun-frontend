"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "warning";
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
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

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-[343px] bg-white rounded-[30px] px-7 py-8 flex flex-col items-center gap-5",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className="w-[60px] h-[60px] rounded-full bg-[#f0f4ff] flex items-center justify-center text-[28px]">
            {icon}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-paperlogy font-bold text-[18px] text-text-heading tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="font-paperlogy text-[13px] text-text-primary leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="w-full bg-[#edf5ff] rounded-[15px] px-5 py-4 flex flex-col gap-2">
            {children}
          </div>
        )}

        <div className="w-full flex gap-3 mt-1">
          <Button variant="secondary" className="flex-1" onClick={handleCancel}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} className="flex-1" onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
