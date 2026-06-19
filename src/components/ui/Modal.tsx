"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils";
import { Button } from "./Button";
import { Card } from "./Card";

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
          "w-full max-w-[343px] bg-white rounded-[30px] px-[34px] py-[42px] flex flex-col items-center gap-5",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className="w-[48px] h-[48px] rounded-full bg-system-navbg flex items-center justify-center text-[28px]">
            {icon}
          </div>
        )}

        <div className="flex flex-col items-center gap-[20px] text-center">
          <h2 className="font-ssurround text-xl text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="font-paperlogy text-lg font-semibold text-text-primary leading-relaxed whitespace-pre-line">
              {description}
            </p>
          )}
        </div>

        <Card variant="glass-sm" className="w-full px-5 py-3 flex flex-col gap-2 justify-center">
          {children}
        </Card>

        <div className="w-full flex gap-[25px] mt-1">
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
