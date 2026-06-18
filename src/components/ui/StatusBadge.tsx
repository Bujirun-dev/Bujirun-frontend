import { cn } from "@/shared/utils";

type StatusType = "completed" | "verify" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; style: string }> = {
  completed: {
    label: "수집 완료",
    style: "bg-main-blue text-white",
  },
  verify: {
    label: "인증하기",
    style: "bg-sub-pink text-white",
  },
  pending: {
    label: "인증하기",
    style: "bg-sub-pink text-white",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, style } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-[10px] px-[6px] py-[6px]",
        "font-paperlogy text-xs font-semibold",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
