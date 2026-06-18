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
  options: PermissionOption[];
  className?: string;
}

export function PermissionModal({
  isOpen,
  onClose,
  appName = "BUJIRUN",
  message,
  subMessage,
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
          "w-full max-w-[320px] bg-white rounded-[30px] px-6 py-7 flex flex-col items-center gap-5",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-paperlogy font-bold text-2xl text-text-heading text-center leading-snug">
          "{appName}"이 {message}
        </h2>

        {subMessage && (
          <div className="w-full backdrop-blur-[15px] bg-gradient-to-b from-[rgba(255,255,255,0.52)] to-[rgba(234,244,255,0.39)] border border-[rgba(151,193,255,0.2)] rounded-[10px] px-4 py-3 text-center">
            <p className="font-paperlogy text-sm text-sub-gray">{subMessage}</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { opt.onClick(); onClose(); }}
              className="w-full h-[50px] rounded-[14px] font-paperlogy font-semibold text-md transition-opacity active:opacity-80 bg-main-blue text-white"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
