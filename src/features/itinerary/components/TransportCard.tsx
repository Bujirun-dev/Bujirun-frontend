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
  택시: "bg-sub-coral",
};

export function TransportCard({ from, to, durationMin, cost, legs, isRecommended, selected, className }: TransportCardProps) {
  return (
    <div className={cn(
      "rounded-[15px] w-[285px] py-[15px] px-[10px] border",
      selected === false
        ? "bg-main-white border-sub-lightgray"
        : "bg-system-navbg border-main-blue/30",
      className
    )}>
      <div className="relative flex flex-col gap-3">
        {/* 세로 점선 — 좌측 아이콘 컬럼 중앙(12px)에 고정 */}
        <div
          className="absolute inset-y-0 border-l-[1.6px] border-dashed border-sub-gray"
          style={{ left: "11.2px" }}
        />

        {/* 출발 장소 */}
        <div className="flex items-center gap-3">
          <div className="w-6 flex justify-center shrink-0 relative z-10">
            <div
              className="w-3 h-3 rounded-full bg-sub-gray"
              style={{ boxShadow: selected === false ? "0 0 0 3px var(--color-main-white)" : "0 0 0 3px var(--color-system-navbg)" }}
            />
          </div>
          <div className="flex flex-1 items-center justify-between min-w-0">
            <span className="font-paperlogy font-semibold text-[14px] text-text-heading">{from}</span>
            <span className="font-paperlogy font-semibold text-[11px] text-sub-darkgray shrink-0 ml-2">
              {isRecommended && "⭐ "}{durationMin}분{cost !== undefined ? ` · ${cost.toLocaleString()}원` : ""}
            </span>
          </div>
        </div>

        {legs.map((leg, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={cn(
                "w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 relative z-10",
                TRANSPORT_COLORS[leg.type]
              )}
            >
              <Image src={TRANSPORT_ICONS[leg.type]} alt={leg.type} width={14} height={14} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-paperlogy font-semibold text-[14px] text-text-heading leading-none">
                {leg.routeName}
              </span>
              <span className="font-paperlogy font-normal text-[11px] text-sub-darkgray truncate">
                {leg.from} → {leg.to}
              </span>
            </div>
          </div>
        ))}

        {/* 도착 장소 */}
        <div className="flex items-center gap-3">
          <div className="w-6 flex justify-center shrink-0 relative z-10">
            <div
              className="w-3 h-3 rounded-full bg-sub-gray"
              style={{ boxShadow: selected === false ? "0 0 0 3px var(--color-main-white)" : "0 0 0 3px var(--color-system-navbg)" }}
            />
          </div>
          <span className="font-paperlogy font-semibold text-[14px] text-text-heading">{to}</span>
        </div>
      </div>
    </div>
  );
}
