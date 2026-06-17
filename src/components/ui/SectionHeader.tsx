import { cn } from "@/shared/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <span className="font-paperlogy font-bold text-[15px] text-text-heading">{title}</span>
        {subtitle && (
          <span className="font-paperlogy text-[12px] text-sub-gray">{subtitle}</span>
        )}
      </div>
      {actionLabel && (
        <button onClick={onAction}>
          <span className="font-paperlogy text-[12px] text-sub-deepblue">{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
