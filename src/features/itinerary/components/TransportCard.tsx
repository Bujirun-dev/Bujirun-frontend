import { cn } from "@/shared/utils";

type TransportType = "버스" | "지하철" | "도보";

interface TransportCardProps {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  durationMin: number;
  cost?: number;
  className?: string;
}

export function TransportCard({
  type,
  routeName,
  from,
  to,
  durationMin,
  cost,
  className,
}: TransportCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "bg-sub-green rounded-[16px] px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-paperlogy text-xs font-semibold text-text-primary bg-white/60 rounded-[8px] px-2 py-1">
          {type}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-paperlogy font-bold text-md text-text-heading">{routeName}</span>
          <span className="font-paperlogy text-xs text-text-primary">
            {from} → {to}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="font-paperlogy text-sm text-text-primary">⏱ {durationMin}min</span>
        {cost !== undefined && (
          <span className="font-paperlogy text-sm text-text-primary">
            ₩{cost.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
