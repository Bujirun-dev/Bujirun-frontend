"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import characterImg from "@/assets/character/face.png";
import { Modal, TimePicker, PageCard } from "@/components";
import {
  ItineraryTimeline,
  ItineraryHeader,
  DayNavigator,
  TransportSelectSheet,
  ArrivalVerifyModal,
} from "@/features/itinerary";
import type { ItineraryStop } from "@/features/itinerary";
import { getScheduleById, getPlaceById } from "@/mocks";
import type { TravelMode } from "@/shared/types";
import type { Category } from "@/components";

// ── 더미 데이터 변환 헬퍼 ──────────────────────────────
const FALLBACK_IMAGE = "https://picsum.photos/seed/busan/300/200";

const CATEGORY_MAP: Record<string, Category> = {
  "자연·공원": "nature",
  "역사·문화": "culture",
  "체험·레저": "experience",
  "음식·카페": "experience",
};

const TRAVEL_MODE_MAP: Record<TravelMode, "버스" | "지하철" | "도보" | "택시"> = {
  transit: "버스",
  bus: "버스",
  walk: "도보",
  taxi: "택시",
};

type BaseStop = Omit<
  ItineraryStop,
  "onDelete" | "onClick" | "onTimeClick" | "onTransportClick" | "onVerify"
>;

function buildDays(scheduleId: string): { days: BaseStop[][]; dates: string[] } {
  const schedule = getScheduleById(scheduleId);
  if (!schedule) return { days: [], dates: [] };

  const days = schedule.days.map((day) =>
    day.items.map((item, idx): BaseStop => {
      const place = getPlaceById(item.spotId);
      const nextItem = day.items[idx + 1];
      const nextPlace = nextItem ? getPlaceById(nextItem.spotId) : undefined;

      return {
        id: item.id,
        time: item.arrivalTime,
        placeName: item.spotName,
        imageUrl: place?.thumbnailUrl || FALLBACK_IMAGE,
        category: CATEGORY_MAP[place?.category ?? ""] ?? "nature",
        status: "verify",
        transport: nextItem
          ? {
              from: item.spotName,
              to: nextItem.spotName,
              durationMin: nextItem.travelTimeMin,
              baseDurationMin: nextItem.travelTimeMin,
              legs: [
                {
                  type: TRAVEL_MODE_MAP[nextItem.travelMode] ?? "버스",
                  routeName: nextItem.routeName ?? TRAVEL_MODE_MAP[nextItem.travelMode] ?? "버스",
                  from: place?.address ?? item.spotName,
                  to: nextPlace?.address ?? nextItem.spotName,
                },
              ],
            }
          : undefined,
      };
    })
  );

  const dates = schedule.days.map((d) => {
    const [, month, day] = d.date.split("-");
    return `2026.${month}.${day}`;
  });

  return { days, dates };
}

// ── 페이지 ─────────────────────────────────────────────
const SCHEDULE_ID = "660e8400-e29b-41d4-a716-446655440000"; // 해운대 힐링 코스
const { days: INITIAL_DAYS, dates: TRIP_DATES } = buildDays(SCHEDULE_ID);

type ModalType = "optimize" | "delete" | "time" | "transport" | "verify";

export default function ItineraryPage() {
  const router = useRouter();

  const [currentDay, setCurrentDay] = useState(0);
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(INITIAL_DAYS);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0 });
  const [selectedRouteOptionId, setSelectedRouteOptionId] = useState<string>("transit");

  const touchStartX = useRef(0);

  const activeStop = stopsPerDay[activeDayIdx].find((s) => s.id === activeStopId);

  const openDelete = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("delete");
  };
  const openTime = (dayIdx: number, id: string, time: string) => {
    const [h, m] = time.split(":").map(Number);
    setTimeValue({ hour: h, minute: m });
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("time");
  };
  const openTransport = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("transport");
  };
  const openVerify = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx); setActiveStopId(id); setModal("verify");
  };
  const closeModal = () => setModal(null);

  const confirmDelete = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].filter((s) => s.id !== activeStopId);
      return next;
    });
    closeModal();
  };

  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = [...next[activeDayIdx]]
        .map((s) => (s.id === activeStopId ? { ...s, time: timeStr } : s))
        .sort((a, b) => a.time.localeCompare(b.time));
      return next;
    });
    closeModal();
  };

  const confirmTransport = (option: import("@/features/itinerary").RouteOption) => {
    setSelectedRouteOptionId(option.id);
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId && s.transport
          ? { ...s, transport: { ...s.transport, legs: option.legs, durationMin: option.durationMin, cost: option.cost, baseDurationMin: s.transport.baseDurationMin } }
          : s
      );
      return next;
    });
    closeModal();
  };

  const confirmVerify = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId ? { ...s, status: "completed" as const } : s
      );
      return next;
    });
    closeModal();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && currentDay < stopsPerDay.length - 1) setCurrentDay((d) => d + 1);
    if (diff < 0 && currentDay > 0) setCurrentDay((d) => d - 1);
  };

  const allDayStops: ItineraryStop[][] = stopsPerDay.map((dayStops, dayIdx) =>
    dayStops.map((stop) => ({
      ...stop,
      onClick: () => router.push(`/itinerary/place/${stop.id}`),
      onDelete: () => openDelete(dayIdx, stop.id),
      onTimeClick: () => openTime(dayIdx, stop.id, stop.time),
      onTransportClick: stop.transport ? () => openTransport(dayIdx, stop.id) : undefined,
      onVerify: stop.status === "verify" ? () => openVerify(dayIdx, stop.id) : undefined,
    }))
  );

  const schedule = getScheduleById(SCHEDULE_ID);

  return (
    <div className="relative h-full">
    <PageCard>
        <ItineraryHeader
          currentDay={currentDay}
          tripName={schedule?.title ?? "부지렁즈"}
          onLogsClick={() => router.push("/itinerary/logs")}
          onOptimizeClick={() => setModal("optimize")}
          onTripsClick={() => router.push("/itinerary/trips")}
        />

        {/* 슬라이딩 타임라인 */}
        <div className="-ml-2.5 flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentDay * 100}%)` }}
          >
            {allDayStops.map((dayStops, dayIdx) => (
              <div
                key={dayIdx}
                className="native-scroll-hidden box-border w-full min-w-0 h-full shrink-0 overflow-y-scroll pl-0 pr-1 pb-6"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <ItineraryTimeline
                  stops={dayStops}
                  date={TRIP_DATES[dayIdx]}
                  onAdd={() => router.push("/itinerary/search")}
                />
              </div>
            ))}
          </div>
        </div>

        <DayNavigator
          totalDays={stopsPerDay.length}
          currentDay={currentDay}
          onDayChange={setCurrentDay}
        />
    </PageCard>

      {/* 모달들 */}
      <Modal
        isOpen={modal === "optimize"}
        onClose={closeModal}
        title="일정 최적화"
        description={`AI가 현재 일정의 이동 동선을\n최적화해드립니다.`}
        confirmText="최적화 시작"
        cancelText="취소"
        confirmVariant="primary"
        onConfirm={closeModal}
        onCancel={closeModal}
      />

      <Modal
        isOpen={modal === "delete"}
        onClose={closeModal}
        title="일정 삭제"
        description={`해당 관광지를 일정에서\n삭제하시겠어요?`}
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="warning"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />

      <TimePicker
        isOpen={modal === "time"}
        hour={timeValue.hour}
        minute={timeValue.minute}
        onChange={(h, m) => setTimeValue({ hour: h, minute: m })}
        onConfirm={confirmTime}
        onClose={closeModal}
      />

      <TransportSelectSheet
        isOpen={modal === "transport"}
        onClose={closeModal}
        from={activeStop?.transport?.from ?? "출발 장소"}
        to={activeStop?.transport?.to ?? "도착 장소"}
        selectedOptionId={selectedRouteOptionId}
        options={(() => {
          const base = activeStop?.transport?.baseDurationMin ?? 30;
          const f = activeStop?.transport?.from ?? "";
          const t = activeStop?.transport?.to ?? "";
          return [
            {
              id: "transit",
              isRecommended: true,
              durationMin: base,
              cost: 1500,
              legs: (activeStop?.transport?.legs ?? []).filter((l) => l.type === "버스" || l.type === "지하철").length > 0
                ? activeStop!.transport!.legs.filter((l) => l.type === "버스" || l.type === "지하철")
                : [{ type: "버스" as const, routeName: "버스", from: f, to: t }],
            },
            {
              id: "taxi",
              durationMin: Math.round(base * 0.6),
              cost: 14500,
              legs: [{ type: "택시" as const, routeName: "택시", from: f, to: t }],
            },
            {
              id: "walk",
              durationMin: base * 3,
              cost: 0,
              legs: [{ type: "도보" as const, routeName: "도보", from: f, to: t }],
            },
          ];
        })()}
        onSelect={confirmTransport}
      />

      <ArrivalVerifyModal
        isOpen={modal === "verify"}
        onClose={closeModal}
        placeName={activeStop?.placeName ?? ""}
        characterImageUrl={characterImg.src}
        onVerify={confirmVerify}
        onLater={closeModal}
      />
    </div>
  );
}
