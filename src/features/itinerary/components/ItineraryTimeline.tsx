"use client";

import { useState, useRef, useEffect } from "react";
import type { TransportLeg } from "./TransportCard";
import { PlaceCard } from "@/components";
import { TransportCard } from "./TransportCard";
import { PlaceSearchPanel } from "./PlaceSearchPanel";
import { cn } from "@/shared/utils";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify";

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

export function ItineraryTimeline({ stops, date }: ItineraryTimelineProps) {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const openSearch = (stopId: string) => setActiveStopId(stopId);
  const closeSearch = () => setActiveStopId(null);

  useEffect(() => {
    if (!activeStopId) return;
    const el = stopRefs.current.get(activeStopId);
    if (!el) return;
    let scrollParent: HTMLElement | null = el.parentElement;
    while (scrollParent) {
      const ov = getComputedStyle(scrollParent).overflowY;
      if (ov === "scroll" || ov === "auto") break;
      scrollParent = scrollParent.parentElement;
    }
    if (!scrollParent) return;
    const top =
      el.getBoundingClientRect().top -
      scrollParent.getBoundingClientRect().top +
      scrollParent.scrollTop -
      40;
    scrollParent.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeStopId]);

  const handleRootClick = (e: React.MouseEvent) => {
    if (!activeStopId) return;
    if (searchCardRef.current?.contains(e.target as Node)) return;
    if ((e.target as Element).closest("[data-time-btn]")) return;
    closeSearch();
  };

  return (
    <div className="relative min-h-full min-w-0 pb-3.5" onClick={handleRootClick}>
      {/* 세로 타임라인 선 */}
      <div className="absolute top-0 bottom-0 left-[46px] w-[2px] rounded-full bg-sub-lightgray" />

      <div className={cn("flex flex-col gap-5", activeStopId && "pb-[470px]")}>
        {/* 상단: + 버튼 + 날짜 (검색 중엔 + 버튼만 숨김) */}
        <div className="flex items-center">
          <div className="w-10 shrink-0" />
          <div className="relative z-10 -ml-0.5 flex items-center gap-2.5">
            <button
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-md bg-sub-coral",
                activeStopId && "invisible",
              )}
              onClick={() => stops[0] && openSearch(stops[0].id)}
            >
              <span className="font-bold leading-none text-white text-xs">+</span>
            </button>
            <span className="font-paperlogy text-xs font-semibold text-sub-gray">{date}</span>
          </div>
        </div>

        {stops.map((stop) => {
          const isActive = activeStopId === stop.id;
          return (
            <div
              key={stop.id}
              ref={(el) => { if (el) stopRefs.current.set(stop.id, el); else stopRefs.current.delete(stop.id); }}
              className="min-w-0"
            >
              <div className="relative flex min-w-0 items-center">
                {/* 시간 버튼 */}
                <button
                  data-time-btn
                  className="flex w-10 shrink-0 justify-end pr-2"
                  onClick={() => openSearch(stop.id)}
                >
                  {isActive ? (
                    <div className="flex items-center justify-center rounded-md border border-dashed border-sub-gray p-1">
                      <span className="font-paperlogy text-xs font-medium text-sub-gray">
                        {stop.time}
                      </span>
                    </div>
                  ) : (
                    <span className="font-paperlogy text-xs font-medium tracking-[0.6px] text-sub-deepblue">
                      {stop.time}
                    </span>
                  )}
                </button>

                {/* 도트 */}
                <div
                  className={cn(
                    "relative z-10 h-3 w-3 shrink-0 rounded-full",
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
                      className="flex h-[470px] w-full flex-col overflow-hidden rounded-[30px] bg-white p-4"
                      style={{
                        border: "0.5px solid var(--color-system-glassborder)",
                        boxShadow: "2px 2px 10px 0px var(--color-system-glassborder)",
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
                  <div className="w-16 shrink-0" />
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
