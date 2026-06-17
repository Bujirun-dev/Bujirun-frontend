import Image from "next/image";
import { cn } from "@/shared/utils";

interface PermissionOption {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
}

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  message: string;
  subMessage?: string;
  characterImageUrl?: string;
  options: PermissionOption[];
  className?: string;
}

export function PermissionModal({
  isOpen,
  onClose,
  appName = "BUJIRUN",
  message,
  subMessage,
  characterImageUrl,
  options,
  className,
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-system-blackbg)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-[320px] bg-white rounded-[30px] px-6 py-7 flex flex-col items-center gap-4",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-paperlogy font-bold text-[15px] text-text-heading">
            "{appName}"이 {message}
          </p>
          {subMessage && (
            <p className="font-paperlogy text-[12px] text-sub-gray">{subMessage}</p>
          )}
        </div>

        {characterImageUrl && (
          <div className="relative w-[100px] h-[100px]">
            <Image src={characterImageUrl} alt="character" fill className="object-contain" />
          </div>
        )}

        <div className="w-full flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { opt.onClick(); onClose(); }}
              className={cn(
                "w-full h-[44px] rounded-[12px] font-paperlogy font-semibold text-[13px] transition-opacity active:opacity-80",
                opt.variant === "primary"
                  ? "bg-main-blue text-white"
                  : "bg-system-searchbg text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
