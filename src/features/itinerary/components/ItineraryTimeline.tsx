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
  date?: string;
  onAdd?: () => void;
}

export function ItineraryTimeline({ stops, date, onAdd }: ItineraryTimelineProps) {
  return (
    <div className="relative">
      {/* 세로 타임라인 선 */}
      <div
        className="absolute top-0 bottom-[-24px] w-[2px] bg-sub-lightgray"
        style={{ left: "46px" }}
      />

      <div className="flex flex-col gap-5">
        {/* 상단: + 버튼 + 날짜 */}
        <div className="flex items-center">
          <div className="w-10 shrink-0" />
          <div className="flex items-center gap-[10px] relative z-10 -ml-[3px]">
            <button
              className="flex size-[18px] items-center justify-center rounded-[6px] bg-sub-coral shrink-0"
              onClick={onAdd}
            >
              <span className="text-white text-xs font-bold leading-none">+</span>
            </button>
            <span className="font-paperlogy text-[11px] font-semibold text-sub-gray">{date}</span>
          </div>
        </div>

        {stops.map((stop) => (
          <div key={stop.id}>
            {/* 시간 + 도트 + 장소 카드 */}
            <div className="flex items-center">
              <button
                className="w-10 shrink-0 text-right font-paperlogy text-xs font-medium text-sub-deepblue tracking-[0.6px] pr-[10px]"
                onClick={stop.onTimeClick}
              >
                {stop.time}
              </button>
              <div className="w-3 h-3 rounded-full bg-main-blue shrink-0 relative z-10" />
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
                className="mt-5 ml-[64px] w-[calc(100%-64px)] text-left"
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
