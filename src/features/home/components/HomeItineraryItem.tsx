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
  const dotColor = status === "completed" ? "bg-main-blue" : "bg-sub-pink";

  return (
    <div className={cn("flex gap-3", className)}>
      {/* 타임라인 */}
      <div className="flex flex-col items-center pt-1">
        <div className={cn("w-[11px] h-[11px] rounded-full shrink-0", dotColor)} />
        {!isLast && <div className="w-px flex-1 bg-sub-gray mt-[3px]" />}
      </div>

      <div className="flex-1 flex flex-col gap-2 pb-5">
        <div className="flex items-center justify-between">
          <span className="font-paperlogy text-md text-text-heading">{placeName}</span>
          {status && <StatusBadge status={status} />}
        </div>

        {transport && (
          <div className="relative inline-flex items-center gap-2 bg-sub-green rounded-2xl px-[10px] h-[27px] self-start">
            <div
              className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "7px solid var(--color-sub-green)",
              }}
            />
            <span className="font-paperlogy text-xs font-semibold text-main-blue bg-white/80 w-[30px] h-[19px] rounded-full text-center inline-flex items-center justify-center">
              {transport.type}
            </span>
            <span className="font-paperlogy text-xs text-text-primary">
              {transport.routeName}
            </span>
            <span className="font-paperlogy text-xs text-text-primary">
              {transport.durationMin}min
            </span>
            {transport.nextStop && (
              <span className="font-paperlogy text-xs font-semibold text-sub-coral">
                {transport.nextStop}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
