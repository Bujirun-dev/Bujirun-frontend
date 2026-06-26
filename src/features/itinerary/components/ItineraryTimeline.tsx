"use client";

import { useState, useRef, useEffect } from "react";
import { PlaceCard } from "@/components";
import { TransportCard } from "./TransportCard";
import { PlaceSearchPanel } from "./PlaceSearchPanel";
import { cn } from "@/shared/utils";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify";
import type { TransportLeg } from "./TransportCard";

interface TransportInfo {
  from: string;
  to: string;
  durationMin: number;
  baseDurationMin: number;
  cost?: number;
  legs: TransportLeg[];
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
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const openSearch = (stopId: string) => setActiveStopId(stopId);
  const closeSearch = () => setActiveStopId(null);

  // 렌더 후 스크롤 - + 버튼 사라진 이후 정확한 위치로 이동
  useEffect(() => {
    if (!activeStopId) return;
    const el = stopRefs.current.get(activeStopId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStopId]);

  // 타임라인 루트 클릭: 검색 카드 바깥 + 시간 버튼 아닌 곳 클릭 시 닫기
  const handleRootClick = (e: React.MouseEvent) => {
    if (!activeStopId) return;
    if (searchCardRef.current?.contains(e.target as Node)) return;
    if ((e.target as Element).closest("[data-time-btn]")) return;
    closeSearch();
  };

  return (
    <div className="relative min-h-full min-w-0 pb-3.5" onClick={handleRootClick}>
      {/* 세로 타임라인 선 */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-sub-lightgray rounded-full"
        style={{ left: "46px" }}
      />

      <div className={cn("flex flex-col gap-5", activeStopId && "pb-[470px]")}>
        {/* 상단: + 버튼 + 날짜 (검색 중엔 숨김) */}
        {!activeStopId && (
          <div className="flex items-center">
            <div className="w-10 shrink-0" />
            <div className="flex items-center gap-2.5 relative z-10 -ml-0.5">
              <button
                className="flex size-[18px] items-center justify-center rounded-md bg-sub-coral shrink-0"
                onClick={() => stops[0] && openSearch(stops[0].id)}
              >
                <span className="text-white text-xs font-bold leading-none">+</span>
              </button>
              <span className="font-paperlogy text-xs font-semibold text-sub-gray">{date}</span>
            </div>
          </div>
        )}

        {stops.map((stop) => {
          const isActive = activeStopId === stop.id;
          return (
            <div
              key={stop.id}
              ref={(el) => {
                if (el) stopRefs.current.set(stop.id, el);
                else stopRefs.current.delete(stop.id);
              }}
              className="min-w-0"
            >
              <div className="relative flex min-w-0 items-center">
                {/* 시간 버튼 - active면 점선 박스 */}
                <button
                  data-time-btn
                  className="w-10 shrink-0 flex justify-end pr-2"
                  onClick={() => openSearch(stop.id)}
                >
                  {isActive ? (
                    <div className="border border-dashed border-sub-gray rounded-md w-[42px] h-[20px] flex items-center justify-center">
                      <span className="font-paperlogy text-xs font-medium text-sub-gray">
                        {stop.time}
                      </span>
                    </div>
                  ) : (
                    <span className="font-paperlogy text-xs font-medium text-sub-deepblue tracking-[0.6px]">
                      {stop.time}
                    </span>
                  )}
                </button>

                {/* 도트 - active면 주황 */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0 relative z-10",
                    isActive ? "bg-sub-coral" : "bg-main-blue",
                  )}
                />

                <div className="min-w-0 flex-1 pl-3">
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

                {/* 검색 카드 */}
                {isActive && (
                  <div ref={searchCardRef} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
                    <div
                      className="w-full h-[470px] rounded-[30px] bg-white overflow-hidden flex flex-col p-4"
                      style={{
                        border: "0.5px solid rgba(151, 193, 255, 0.2)",
                        boxShadow: "2px 2px 10px 0px rgba(151, 193, 255, 0.2)",
                      }}
                    >
                      <PlaceSearchPanel onClose={closeSearch} />
                    </div>
                  </div>
                )}
              </div>

              {/* 교통수단 카드 */}
              {stop.transport && (
                <div className="mt-5 flex min-w-0">
                  <div className="w-[64px] shrink-0" />
                  <button className="min-w-0 flex-1 text-left" onClick={stop.onTransportClick}>
                    <TransportCard {...stop.transport} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
