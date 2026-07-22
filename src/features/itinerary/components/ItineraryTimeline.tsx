"use client";

import { useState, useRef, useEffect } from "react";
import PlusIcon from "@/assets/icons/itinerary/plus-small.svg?svgr";
import type { TransportLeg } from "./TransportCard";
import { PlaceCard, EmptyState } from "@/components";
import { TransportCard } from "./TransportCard";
import { TimelinePlaceDetailPopup } from "./TimelinePlaceDetailPopup";
import { TimelineSearchPopup } from "./TimelineSearchPopup";
import { TimelineSearchTrigger } from "./TimelineSearchTrigger";
import { TimelineTimePicker } from "./TimelineTimePicker";
import { cn } from "@/shared/utils";
import type { Category } from "@/components";
import type { SearchPlace } from "./PlaceSearchPanel";
import { CollaboratorBadge } from "./CollaboratorBadge";
import type { CollaboratorInfo } from "@/features/itinerary/collab/useCollaborativeItinerary";

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
  // 인증하기(ArrivalVerifyModal)에 넘길 실제 관광지 ID. item.id(=id, 일정 아이템 ID)와는 다르다.
  spotId?: string;
  time: string;
  placeName: string;
  imageUrl: string;
  category: Category;
  status: PlaceStatus;
  description?: string;
  address?: string;
  mapUrl?: string;
  isBookmarked?: boolean;
  relatedLogs?: { id: string; imageUrl: string; userName: string }[];
  transport?: TransportInfo;
  // 지금 이 항목을 보고 있는 다른 참여자 목록 (실시간 공동편집, WS 미연결 시 항상 빈 배열)
  activeEditors?: CollaboratorInfo[];
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
  onAddNewPlace?: (place: SearchPlace) => void;
  // 지금 이 날에서 유저가 보고 있는 항목이 바뀔 때마다 알려준다 (실시간 공동편집 프레즌스용)
  onFocusChange?: (stopId: string | null) => void;
}

export function ItineraryTimeline({
  stops,
  date,
  onAddNewPlace,
  onFocusChange,
}: ItineraryTimelineProps) {
  const [activeSearchStopId, setActiveSearchStopId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeDetailStopId, setActiveDetailStopId] = useState<string | null>(null);
  const [activeTimeStopId, setActiveTimeStopId] = useState<string | null>(null);
  const [inlineTimeValue, setInlineTimeValue] = useState({ hour: 12, minute: 0 });
  const [popupScrollSpace, setPopupScrollSpace] = useState(0);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const addNewCardRef = useRef<HTMLDivElement>(null);
  const detailCardRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isAutoScrollingRef = useRef(false);
  const activePopupStopId = activeSearchStopId ?? activeDetailStopId;
  const focusedStopId = activeSearchStopId ?? activeDetailStopId ?? activeTimeStopId ?? null;

  useEffect(() => {
    onFocusChange?.(focusedStopId);
    return () => onFocusChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedStopId]);

  const closeSearch = () => {
    setActiveSearchStopId(null);
    setPopupScrollSpace(0);
  };
  const openAddNew = () => {
    setActiveTimeStopId(null);
    setActiveDetailStopId(null);
    setActiveSearchStopId(null);
    setPopupScrollSpace(0);
    setIsAddingNew(true);
  };
  const closeAddNew = () => setIsAddingNew(false);
  const openDetail = (stop: ItineraryStop) => {
    setActiveTimeStopId(null);
    setActiveSearchStopId(null);
    setIsAddingNew(false);
    setPopupScrollSpace(0);
    setActiveDetailStopId(stop.id);
    stop.onClick?.();
  };
  const closeDetail = () => {
    setActiveDetailStopId(null);
    setPopupScrollSpace(0);
  };
  const openTimePicker = (stop: ItineraryStop) => {
    closeSearch();
    closeDetail();
    closeAddNew();
    const [h, m] = stop.time.split(":").map(Number);
    setInlineTimeValue({ hour: h, minute: m });
    setActiveTimeStopId(stop.id);
  };
  const closeTimePicker = () => {
    pendingAutoTimeRef.current = false;
    setActiveTimeStopId(null);
  };
  const pendingAutoTimeRef = useRef(false);
  // 추가 직후 시간 변경 팝업을 곧바로 띄우면 너무 급하게 느껴져서, 처음 한 번만
  // 살짝 텀을 두고 연다 (그 사이 "추가되었어요" 토스트가 먼저 보이도록).
  const autoOpenDelayedRef = useRef(false);
  const handleAddNewPlace = (place: SearchPlace) => {
    pendingAutoTimeRef.current = true;
    autoOpenDelayedRef.current = false;
    onAddNewPlace?.(place);
  };
  useEffect(() => {
    // 추가 직후 임시 id가 실제 id로 교체돼도(같은 길이) 계속 마지막 stop을 기준으로
    // 다시 열어줘야, 그 사이 팝업이 닫혀버리지 않는다. 사용자가 직접 닫거나 확정하면
    // closeTimePicker에서 pendingAutoTimeRef를 꺼서 더 이상 재오픈되지 않게 한다.
    if (!pendingAutoTimeRef.current) return;
    const newest = stops[stops.length - 1];
    if (!newest) return;

    if (!autoOpenDelayedRef.current) {
      autoOpenDelayedRef.current = true;
      const timer = window.setTimeout(() => openTimePicker(newest), 700);
      return () => window.clearTimeout(timer);
    }

    openTimePicker(newest);
    // openTimePicker는 매 렌더마다 새로 만들어져서 참조 자체를 deps에 넣으면 안 됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);
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
    if (isAddingNew) {
      if (addNewCardRef.current?.contains(target)) return;
      closeAddNew();
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

  const isEmpty = stops.length === 0;

  return (
    <div className="relative min-h-full min-w-0 pb-16" onClick={handleRootClick}>
      {/* 세로 타임라인 선 — 일정이 하나도 없을 땐 그릴 대상이 없으니 숨긴다 */}
      {!isEmpty && (
        <div className="absolute top-0 bottom-0 left-[45px] w-[2px] rounded-full bg-sub-lightgray" />
      )}

      <div
        className={cn("flex flex-col gap-5", isEmpty && "h-full")}
        style={{ paddingBottom: popupScrollSpace }}
      >
        {/* 상단: + 버튼 + 날짜 (검색 중이거나 빈 날엔 + 버튼만 숨김 — 빈 날은 아래 안내 카드의 버튼으로 대신함) */}
        <div className="relative flex items-center">
          <div className="w-10 shrink-0" />
          <div className="relative z-10 -ml-0.5 flex items-center gap-2.5">
            <button
              type="button"
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-md bg-sub-coral active:opacity-70",
                (activeSearchStopId || isAddingNew || isEmpty) && "invisible",
              )}
              onClick={openAddNew}
              aria-label="장소 추가"
            >
              <PlusIcon width={16} height={16} className="text-main-white" aria-hidden />
            </button>
            <span className="text-xs font-semibold text-sub-gray">{date}</span>
          </div>

          {isAddingNew && (
            <TimelineSearchPopup
              ref={addNewCardRef}
              onClose={closeAddNew}
              onAddToItinerary={handleAddNewPlace}
            />
          )}
        </div>

        {isEmpty && !isAddingNew && (
          <EmptyState
            size="sm"
            imageSize={120}
            title="아직 이 날 일정이 없어요"
            actionLabel="+ 일정 추가"
            actionClassName="w-auto px-4"
            onAction={openAddNew}
          />
        )}

        {/* 관광지 검색창이 떠 있는 동안엔 상단바/타임라인 선은 그대로 두고
            나머지 일정/교통수단 아이템들만 가린다. */}
        {!isAddingNew &&
          stops.map((stop) => {
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

                  <div className="relative min-w-0 flex-1 pl-3">
                    {stop.activeEditors && stop.activeEditors.length > 0 && (
                      <div className="absolute -top-1.5 left-1.5 z-10">
                        <CollaboratorBadge editors={stop.activeEditors} />
                      </div>
                    )}
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
