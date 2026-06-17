import { cn } from "@/shared/utils";
import { StatusBadge } from "@/components";

type PlaceStatus = "completed" | "verify" | "pending";

interface TransportInfo {
  type: string;
  routeName: string;
  durationMin: number;
  nextStop?: string;
}

interface HomeItineraryItemProps {
  placeName: string;
  status?: PlaceStatus;
  transport?: TransportInfo;
  isLast?: boolean;
  className?: string;
}

export function HomeItineraryItem({
  placeName,
  status,
  transport,
  isLast,
  className,
}: HomeItineraryItemProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {/* 타임라인 도트 */}
      <div className="flex flex-col items-center">
        <div className="w-[8px] h-[8px] rounded-full bg-main-blue mt-1 shrink-0" />
        {!isLast && <div className="w-[1px] flex-1 bg-sub-lightblue mt-1" />}
      </div>

      <div className="flex-1 flex flex-col gap-1.5 pb-3">
        <div className="flex items-center justify-between">
          <span className="font-paperlogy font-semibold text-[13px] text-text-heading">{placeName}</span>
          {status && <StatusBadge status={status} />}
        </div>

        {transport && (
          <div className="flex items-center gap-1.5 bg-sub-green/60 rounded-[8px] px-3 py-1.5">
            <span className="font-paperlogy text-[11px] font-semibold text-text-primary bg-white/60 px-1.5 py-0.5 rounded-[4px]">
              {transport.type}
            </span>
            <span className="font-paperlogy text-[11px] text-text-primary">{transport.routeName}</span>
            <span className="font-paperlogy text-[11px] text-sub-gray">⏱ {transport.durationMin}min</span>
            {transport.nextStop && (
              <span className="font-paperlogy text-[11px] text-sub-coral ml-auto">{transport.nextStop} ❯</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
