"use client";

import { useState, useRef, useEffect } from "react";
import type { TransportLeg } from "./TransportCard";
import { PlaceCard } from "@/components";
import { TransportCard } from "./TransportCard";
import { TimelinePlaceDetailPopup } from "./TimelinePlaceDetailPopup";
import { TimelineSearchPopup } from "./TimelineSearchPopup";
import { TimelineSearchTrigger } from "./TimelineSearchTrigger";
import { TimelineTimePicker } from "./TimelineTimePicker";
import { cn } from "@/shared/utils";
import type { Category } from "@/components";
import type { SearchPlace } from "./PlaceSearchPanel";

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
  description?: string;
  address?: string;
  operatingHours?: string;
  fee?: string;
  parking?: string;
  phone?: string;
  mapUrl?: string;
  isBookmarked?: boolean;
  relatedLogs?: { id: string; imageUrl: string; userName: string }[];
  transport?: TransportInfo;
  onDelete?: () => void;
  onClick?: () => void;
  onTimeClick?: () => void;
  onTimeConfirm?: (time: string) => void;
  onTransportClick?: () => void;
  onVerify?: () => void;
  onAddPlace?: (place: SearchPlace) => void;
}

interface ItineraryTimelineProps {
  stops: ItineraryStop[];
  date?: string;
  onAdd?: () => void;
}

export function ItineraryTimeline({ stops, date }: ItineraryTimelineProps) {
  const [activeSearchStopId, setActiveSearchStopId] = useState<string | null>(null);
  const [activeDetailStopId, setActiveDetailStopId] = useState<string | null>(null);
  const [activeTimeStopId, setActiveTimeStopId] = useState<string | null>(null);
  const [inlineTimeValue, setInlineTimeValue] = useState({ hour: 12, minute: 0 });
  const [popupScrollSpace, setPopupScrollSpace] = useState(0);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const detailCardRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isAutoScrollingRef = useRef(false);
  const activePopupStopId = activeSearchStopId ?? activeDetailStopId;

  const openSearch = (stopId: string) => {
    setActiveTimeStopId(null);
    setActiveDetailStopId(null);
    setPopupScrollSpace(0);
    setActiveSearchStopId(stopId);
  };
  const closeSearch = () => {
    setActiveSearchStopId(null);
    setPopupScrollSpace(0);
  };
  const openDetail = (stop: ItineraryStop) => {
    setActiveTimeStopId(null);
    setActiveSearchStopId(null);
    setPopupScrollSpace(0);
    setActiveDetailStopId(stop.id);
    stop.onClick?.();
  };
  const closeDetail = () => {
    setActiveDetailStopId(null);
    setPopupScrollSpace(0);
  };
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const openTimePicker = (stop: ItineraryStop) => {
    closeSearch();
    closeDetail();
    const [h, m] = stop.time.split(":").map(Number);
    setInlineTimeValue({ hour: h, minute: m });

    const el = stopRefs.current.get(stop.id);
    const appRoot = document.getElementById("app-root");
    if (el && appRoot) {
      const elRect = el.getBoundingClientRect();
      const rootRect = appRoot.getBoundingClientRect();
      const rawTop = elRect.top - rootRect.top;
      const safeTop = Math.min(rawTop, rootRect.height - 228);
      setPickerPosition({
        top: Math.max(8, safeTop),
        left: elRect.left - rootRect.left + 52 + 12,
      });
    }

    setActiveTimeStopId(stop.id);
  };
  const closeTimePicker = () => setActiveTimeStopId(null);
  const confirmInlineTime = (stop: ItineraryStop) => {
    const timeStr = `${String(inlineTimeValue.hour).padStart(2, "0")}:${String(inlineTimeValue.minute).padStart(2, "0")}`;
    stop.onTimeConfirm?.(timeStr);
    closeTimePicker();
  };

  useEffect(() => {
    if (!activePopupStopId) return;
    const el = stopRefs.current.get(activePopupStopId);
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
    const maxScrollTopWithoutDynamicSpace = Math.max(0, maxScrollTop - popupScrollSpace);
    const nextPopupScrollSpace = Math.ceil(
      Math.max(0, targetScrollTop - maxScrollTopWithoutDynamicSpace),
    );

    if (nextPopupScrollSpace !== popupScrollSpace) {
      setPopupScrollSpace(nextPopupScrollSpace);
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
      closeTimer = window.setTimeout(() => {
        closeSearch();
        closeDetail();
      }, 250);
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(autoScrollTimer);
      window.clearTimeout(closeTimer);
      scrollParent.removeEventListener("scroll", handleScroll);
    };
  }, [activePopupStopId, popupScrollSpace, stops]);

  const handleRootClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (activeSearchStopId) {
      if (searchCardRef.current?.contains(target)) return;
      if (target.closest("[data-time-btn]")) return;
      closeSearch();
    }
    if (activeDetailStopId) {
      if (detailCardRef.current?.contains(target)) return;
      closeDetail();
    }
    if (activeTimeStopId) {
      if (timePickerRef.current?.contains(target)) return;
      if (target.closest("[data-time-btn]")) return;
      closeTimePicker();
    }
  };

  return (
    <div className="relative min-h-full min-w-0" onClick={handleRootClick}>
      {/* 세로 타임라인 선 */}
      <div className="absolute top-0 bottom-0 left-[45px] w-[2px] rounded-full bg-sub-lightgray" />

      <div className="flex flex-col gap-5" style={{ paddingBottom: popupScrollSpace }}>
        {/* 상단: + 버튼 + 날짜 (검색 중엔 + 버튼만 숨김) */}
        <div className="flex items-center">
          <div className="w-10 shrink-0" />
          <div className="relative z-10 -ml-0.5 flex items-center gap-2.5">
            <button
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-md bg-sub-coral",
                activeSearchStopId && "invisible",
              )}
              onClick={() => stops[0] && openSearch(stops[0].id)}
            >
              <span className="font-bold leading-none text-main-white text-xs">+</span>
            </button>
            <span className="text-xs font-semibold text-sub-gray">{date}</span>
          </div>
        </div>

        {stops.map((stop) => {
          const isSearchActive = activeSearchStopId === stop.id;
          const isDetailActive = activeDetailStopId === stop.id;
          const isTimeActive = activeTimeStopId === stop.id;
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
                  isActive={isSearchActive}
                  isTimeActive={isTimeActive}
                  onTimeClick={() => openTimePicker(stop)}
                />

                <div className="min-w-0 flex-1 pl-3">
                  <PlaceCard
                    imageUrl={stop.imageUrl}
                    name={stop.placeName}
                    category={stop.category}
                    status={stop.status}
                    onDelete={stop.onDelete}
                    onClick={() => openDetail(stop)}
                    onVerify={stop.onVerify}
                  />
                </div>

                {/* 검색 카드 */}
                {isSearchActive && (
                  <TimelineSearchPopup
                    ref={searchCardRef}
                    onClose={closeSearch}
                    onAddToItinerary={stop.onAddPlace}
                  />
                )}

                {/* 관광지 상세 카드 */}
                {isDetailActive && (
                  <TimelinePlaceDetailPopup
                    ref={detailCardRef}
                    stop={stop}
                    onClose={closeDetail}
                  />
                )}

                {/* 시간 변경 카드 */}
                {isTimeActive && (
                  <TimelineTimePicker
                    ref={timePickerRef}
                    hour={inlineTimeValue.hour}
                    minute={inlineTimeValue.minute}
                    top={pickerPosition.top}
                    left={pickerPosition.left}
                    onChange={(h, m) => setInlineTimeValue({ hour: h, minute: m })}
                    onConfirm={() => confirmInlineTime(stop)}
                    onClose={closeTimePicker}
                  />
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
