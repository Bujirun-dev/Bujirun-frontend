import Image from "next/image";
import busIcon from "@/assets/icons/itinerary/bus.png";
import subwayIcon from "@/assets/icons/itinerary/subway.png";
import walkIcon from "@/assets/icons/itinerary/walk.png";
import taxiIcon from "@/assets/icons/itinerary/taxi.png";
import { cn } from "@/shared/utils";
import type { StaticImageData } from "next/image";

type TransportType = "버스" | "지하철" | "도보" | "택시";

export interface TransportLeg {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
}

interface TransportCardProps {
  from: string;
  to: string;
  durationMin: number;
  cost?: number;
  legs: TransportLeg[];
  isRecommended?: boolean;
  selected?: boolean;
  className?: string;
}

const TRANSPORT_ICONS: Record<TransportType, StaticImageData> = {
  버스: busIcon,
  지하철: subwayIcon,
  도보: walkIcon,
  택시: taxiIcon,
};

const TRANSPORT_COLORS: Record<TransportType, string> = {
  버스: "bg-main-blue",
  지하철: "bg-sub-pink",
  도보: "bg-sub-green",
  택시: "bg-transport-taxi",
};

export function TransportCard({
  from,
  to,
  durationMin,
  cost,
  legs,
  isRecommended,
  selected,
  className,
}: TransportCardProps) {
  const cardBase = cn(
    "w-full min-w-0 overflow-hidden rounded-2xl py-3.5 px-2.5 shadow-sm",
    selected === false ? "bg-main-white" : "bg-system-navbg",
    className,
  );
  const metaText = `${isRecommended ? "⭐ " : ""}${durationMin}분${cost !== undefined ? ` · ${cost.toLocaleString()}원` : ""}`;

  // 단일 leg (택시/도보): 점 없이 심플 레이아웃
  if (legs.length === 1) {
    const leg = legs[0];
    return (
      <div className={cardBase}>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
              TRANSPORT_COLORS[leg.type],
            )}
          >
            <Image src={TRANSPORT_ICONS[leg.type]} alt={leg.type} width={14} height={14} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 truncate font-semibold text-md text-text-heading leading-none">
                {leg.routeName}
              </span>
              <span className="shrink-0 font-semibold text-xs text-sub-darkgray whitespace-nowrap -mt-2">
                {metaText}
              </span>
            </div>
            <span className="font-normal text-xs text-sub-darkgray truncate">
              {leg.from} → {leg.to}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 복수 leg (대중교통): 출발·도착 점 + 점선 풀 레이아웃
  return (
    <div className={cardBase}>
      <div className="relative flex min-w-0 flex-col gap-3">
        <svg
          className="absolute top-[10px] overflow-visible"
          style={{ left: "10.4px", height: "calc(100% - 20px)" }}
          width="1.6"
        >
          <line
            x1="0.8"
            y1="0"
            x2="0.8"
            y2="100%"
            stroke="var(--color-sub-gray)"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </svg>

        {/* 출발 */}
        <div className="flex items-center gap-3">
          <div className="w-6 flex justify-center shrink-0 relative z-10">
            <div
              className="w-3 h-3 rounded-full bg-sub-gray"
              style={{
                boxShadow:
                  selected === false
                    ? "0 0 0 3px var(--color-main-white)"
                    : "0 0 0 3px var(--color-system-navbg)",
              }}
            />
          </div>
          <span className="truncate font-semibold text-md text-text-heading">{from}</span>
        </div>

        {legs.map((leg, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 relative z-10",
                TRANSPORT_COLORS[leg.type],
              )}
            >
              <Image src={TRANSPORT_ICONS[leg.type]} alt={leg.type} width={14} height={14} />
            </div>
            <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-semibold text-md text-text-heading leading-none">
                    {leg.routeName}
                  </span>
                  {index === 0 && (
                    <span className="shrink-0 font-semibold text-xs text-sub-darkgray whitespace-nowrap">
                      {metaText}
                    </span>
                  )}
                </div>
                <span className="font-normal text-xs text-sub-darkgray truncate">
                  {leg.from} → {leg.to}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* 도착 */}
        <div className="flex items-center gap-3">
          <div className="w-6 flex justify-center shrink-0 relative z-10">
            <div
              className="w-3 h-3 rounded-full bg-sub-gray"
              style={{
                boxShadow:
                  selected === false
                    ? "0 0 0 3px var(--color-main-white)"
                    : "0 0 0 3px var(--color-system-navbg)",
              }}
            />
          </div>
          <span className="truncate font-semibold text-md text-text-heading">{to}</span>
        </div>
      </div>
    </div>
  );
}
