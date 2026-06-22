"use client";

import { PlaceCard } from "@/components";
import { TransportCard } from "./TransportCard";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify";
type TransportType = "버스" | "지하철" | "도보" | "택시";

interface TransportInfo {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  durationMin: number;
  cost?: number;
}

export interface ItineraryStop {
  id: string;
  time: string;
  placeName: string;
  imageUrl: string;
  category: Category;
  status: PlaceStatus;
  transport?: TransportInfo;
  onDelete?: () => void;
  onClick?: () => void;
  onTimeClick?: () => void;
  onTransportClick?: () => void;
  onVerify?: () => void;
}

interface ItineraryTimelineProps {
  stops: ItineraryStop[];
}

export function ItineraryTimeline({ stops }: ItineraryTimelineProps) {
  return (
    <div className="relative">
      {/* 세로 타임라인 선 */}
      <div
        className="absolute top-2 bottom-0 w-px bg-[rgba(151,193,255,0.4)]"
        style={{ left: "54px" }}
      />

      <div className="flex flex-col gap-5">
        {stops.map((stop) => (
          <div key={stop.id}>
            {/* 시간 + 도트 + 장소 카드 */}
            <div className="flex items-start">
              <button
                className="w-12 shrink-0 text-right font-paperlogy text-xs font-medium text-sub-deepblue tracking-[0.6px] pr-[10px] pt-[3px]"
                onClick={stop.onTimeClick}
              >
                {stop.time}
              </button>
              <div className="w-3 h-3 rounded-[4px] bg-main-blue shrink-0 mt-[3px] relative z-10" />
              <div className="flex-1 pl-3">
                <PlaceCard
                  imageUrl={stop.imageUrl}
                  name={stop.placeName}
                  category={stop.category}
                  status={stop.status}
                  onDelete={stop.onDelete}
                  onClick={stop.onClick}
                  onVerify={stop.onVerify}
                />
              </div>
            </div>

            {/* 교통수단 카드 */}
            {stop.transport && (
              <button
                className="mt-3 ml-[60px] w-[calc(100%-60px)] text-left"
                onClick={stop.onTransportClick}
              >
                <TransportCard {...stop.transport} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
