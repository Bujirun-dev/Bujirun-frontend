import { cn } from "@/shared/utils";

type StatusType = "completed" | "verify" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; style: string }> = {
  completed: {
    label: "수집 완료",
    style: "bg-sub-darkgray text-main-white",
  },
  verify: {
    label: "인증하기",
    style: "bg-sub-pink text-text-primary",
  },
  pending: {
    label: "미수집",
    style: "bg-sub-pink text-text-primary",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, style } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-[26px] px-3 rounded-[10px]",
        "font-paperlogy text-[11px] font-semibold",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
