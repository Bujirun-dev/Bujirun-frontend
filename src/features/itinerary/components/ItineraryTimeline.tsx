"use client";

import { useState, useRef, useEffect } from "react";
import type { TransportLeg } from "./TransportCard";
import { PlaceCard } from "@/components";
import { TransportCard } from "./TransportCard";
import { TimelineSearchPopup } from "./TimelineSearchPopup";
import { TimelineSearchTrigger } from "./TimelineSearchTrigger";
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
  const [searchScrollSpace, setSearchScrollSpace] = useState(0);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isAutoScrollingRef = useRef(false);

  const openSearch = (stopId: string) => {
    setSearchScrollSpace(0);
    setActiveStopId(stopId);
  };
  const closeSearch = () => {
    setActiveStopId(null);
    setSearchScrollSpace(0);
  };

  useEffect(() => {
    if (!activeStopId) return;
    const el = stopRefs.current.get(activeStopId);
    if (!el) return;
    const firstStopEl = stops[0] ? stopRefs.current.get(stops[0].id) : null;
    let scrollParent: HTMLElement | null = el.parentElement;
    while (scrollParent) {
      const ov = getComputedStyle(scrollParent).overflowY;
      if (ov === "scroll" || ov === "auto") break;
      scrollParent = scrollParent.parentElement;
    }
    if (!scrollParent) return;
    const activeTop =
      el.getBoundingClientRect().top -
      scrollParent.getBoundingClientRect().top +
      scrollParent.scrollTop;
    const firstStopTop = firstStopEl
      ? firstStopEl.getBoundingClientRect().top -
        scrollParent.getBoundingClientRect().top +
        scrollParent.scrollTop
      : 40;
    const targetScrollTop = Math.max(0, activeTop - firstStopTop);
    const maxScrollTop = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight);
    const maxScrollTopWithoutDynamicSpace = Math.max(0, maxScrollTop - searchScrollSpace);
    const nextSearchScrollSpace = Math.ceil(
      Math.max(0, targetScrollTop - maxScrollTopWithoutDynamicSpace),
    );

    if (nextSearchScrollSpace !== searchScrollSpace) {
      setSearchScrollSpace(nextSearchScrollSpace);
      return;
    }

    isAutoScrollingRef.current = true;
    scrollParent.scrollTo({ top: targetScrollTop, behavior: "smooth" });

    const autoScrollTimer = window.setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 900);
    let closeTimer: number | undefined;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      if (Math.abs(scrollParent.scrollTop - targetScrollTop) < 90) return;
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(closeSearch, 250);
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(autoScrollTimer);
      window.clearTimeout(closeTimer);
      scrollParent.removeEventListener("scroll", handleScroll);
    };
  }, [activeStopId, searchScrollSpace, stops]);

  const handleRootClick = (e: React.MouseEvent) => {
    if (!activeStopId) return;
    if (searchCardRef.current?.contains(e.target as Node)) return;
    if ((e.target as Element).closest("[data-time-btn]")) return;
    closeSearch();
  };

  return (
    <div className="relative min-h-full min-w-0" onClick={handleRootClick}>
      {/* 세로 타임라인 선 */}
      <div className="absolute top-0 bottom-0 left-[46px] w-[2px] rounded-full bg-sub-lightgray" />

      <div className="flex flex-col gap-5" style={{ paddingBottom: searchScrollSpace }}>
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
              <span className="font-bold leading-none text-main-white text-xs">+</span>
            </button>
            <span className="font-paperlogy text-xs font-semibold text-sub-gray">{date}</span>
          </div>
        </div>

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
                <TimelineSearchTrigger
                  time={stop.time}
                  isActive={isActive}
                  onOpen={() => openSearch(stop.id)}
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
                {isActive && <TimelineSearchPopup ref={searchCardRef} onClose={closeSearch} />}
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
