import { cn } from "@/shared/utils";

interface DogamProgressBarProps {
  collectedCount: number;
  totalCount: number;
  className?: string;
}

export function DogamProgressBar({
  collectedCount,
  totalCount,
  className,
}: DogamProgressBarProps) {
  const percent = Math.min(100, Math.round((collectedCount / totalCount) * 100));

  return (
    <div className={cn("flex items-center gap-[12px]", className)}>
      <div className="w-[250px] h-[8px] bg-system-white rounded-full overflow-hidden">
        <div
          className="h-full bg-sub-deepblue rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="shrink-0 flex items-center gap-[3px]">
        <span className="font-paperlogy font-bold text-[14px] text-sub-deepblue">{collectedCount}</span>
        <span className="font-paperlogy text-[9px] text-sub-gray">/</span>
        <span className="font-paperlogy text-[9px] text-sub-gray">{totalCount}</span>
      </div>
    </div>
  );
}
