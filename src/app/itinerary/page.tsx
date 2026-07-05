"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import travelImg from "@/assets/character/travel.png";
import SuccessIcon from "@/assets/icons/mypage/success.svg";
import { PageCard, Button, Toast } from "@/components";
import { ItineraryHeader, SlidingTimeline, ItineraryModals } from "@/features/itinerary";
import type { ItineraryStop, ModalType } from "@/features/itinerary";
import { getScheduleById } from "@/mocks";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import {
  type BaseStop,
  buildDays,
  buildDaysFromLog,
  rebuildTransport,
} from "@/features/itinerary/utils/scheduleUtils";
import type { SearchPlace } from "@/features/itinerary/components/PlaceSearchPanel";
import type { RouteOption } from "@/features/itinerary";

// TODO: 실제 API 연동 시 교체
const MOCK_HAS_ACTIVE_TRIP = true;

const SCHEDULE_ID = "660e8400-e29b-41d4-a716-446655440000";
const { days: INITIAL_DAYS, dates: TRIP_DATES } = buildDays(SCHEDULE_ID);

function ItineraryEmptyState() {
  const router = useRouter();
  return (
    <PageCard>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-10 px-5">
        <Image src={travelImg} alt="여행" width={160} height={160} />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-bold text-xl text-text-heading">아직 여행 일정이 없어요</p>
          <p className="text-sm text-sub-gray">
            부지런즈와 함께
            <br />
            여행을 시작해볼까요?
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push("/itinerary/trips")}>
          여행 목록 보기
        </Button>
      </div>
    </PageCard>
  );
}

export default function ItineraryPage() {
  if (!MOCK_HAS_ACTIVE_TRIP) return <ItineraryEmptyState />;
  return (
    <Suspense fallback={null}>
      <ItineraryMain />
    </Suspense>
  );
}

function ItineraryMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const importedLogId = searchParams.get("importedLogId");
  const requestedDays = Math.max(1, Number(searchParams.get("days")) || INITIAL_DAYS.length);
  const initialDays = INITIAL_DAYS.slice(0, requestedDays);
  const initialDates = TRIP_DATES.slice(0, requestedDays);

  const [currentDay, setCurrentDay] = useState(0);
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(initialDays);
  const [tripDates, setTripDates] = useState<string[]>(initialDates);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0 });
  const [selectedRouteOptionId, setSelectedRouteOptionId] = useState<string>("transit");

  const touchStartX = useRef(0);

  useEffect(() => {
    if (!importedLogId) return;
    const log = SAMPLE_LOGS.find((l) => l.id === importedLogId);
    if (!log) return;
    const { days, dates } = buildDaysFromLog(log);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStopsPerDay(days);
    setTripDates(dates);
    setCurrentDay(0);
    const timer = window.setTimeout(() => {
      setToastMessage("일정이 추가되었어요.");
      window.history.replaceState(null, "", "/itinerary");
    }, 300);
    // TODO: WebSocket 연결 후 아래 핸들러 등록
    // ws.on("itinerary_updated", ({ actorNickname, days, dates }) => {
    //   setStopsPerDay(days); setTripDates(dates); setCurrentDay(0);
    //   setToastMessage(`${actorNickname}님이 일정을 변경했어요.`);
    // });
    return () => window.clearTimeout(timer);
  }, [importedLogId]);

  const activeStop = stopsPerDay[activeDayIdx]?.find((s) => s.id === activeStopId);
  const closeModal = () => setModal(null);

  const openDelete = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("delete");
  };
  const openTime = (dayIdx: number, id: string, time: string) => {
    const [h, m] = time.split(":").map(Number);
    setTimeValue({ hour: h, minute: m });
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("time");
  };
  const openTransport = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("transport");
  };
  const openVerify = (dayIdx: number, id: string) => {
    setActiveDayIdx(dayIdx);
    setActiveStopId(id);
    setModal("verify");
  };

  const confirmDelete = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].filter((s) => s.id !== activeStopId);
      return next;
    });
    closeModal();
    setToastMessage("장소가 삭제되었어요.");
  };
  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    setStopsPerDay((prev) => {
      const next = [...prev];
      const sorted = [...next[activeDayIdx]]
        .map((s) => (s.id === activeStopId ? { ...s, time: timeStr } : s))
        .sort((a, b) => a.time.localeCompare(b.time));
      next[activeDayIdx] = rebuildTransport(sorted);
      return next;
    });
    closeModal();
    setToastMessage("시간이 변경되었어요.");
  };
  const confirmTransport = (option: RouteOption) => {
    setSelectedRouteOptionId(option.id);
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId && s.transport
          ? {
              ...s,
              transport: {
                ...s.transport,
                legs: option.legs,
                durationMin: option.durationMin,
                cost: option.cost,
                baseDurationMin: s.transport.baseDurationMin,
              },
            }
          : s,
      );
      return next;
    });
    closeModal();
    setToastMessage("교통수단이 변경되었어요.");
  };
  const confirmVerify = () => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = next[activeDayIdx].map((s) =>
        s.id === activeStopId ? { ...s, status: "completed" as const } : s,
      );
      return next;
    });
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

  const replaceStop = (dayIdx: number, stopId: string, place: SearchPlace) => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[dayIdx] = rebuildTransport(
        next[dayIdx].map((s) =>
          s.id === stopId
            ? {
                ...s,
                placeName: place.name,
                imageUrl: place.imageUrl,
                category: place.category,
                status: place.status === "completed" ? ("completed" as const) : ("verify" as const),
              }
            : s,
        ),
      );
      return next;
    });
    setToastMessage("관광지가 추가되었어요.");
  };

  const confirmTimeInline = (dayIdx: number, stopId: string, time: string) => {
    setStopsPerDay((prev) => {
      const next = [...prev];
      const sorted = [...next[dayIdx]]
        .map((s) => (s.id === stopId ? { ...s, time } : s))
        .sort((a, b) => a.time.localeCompare(b.time));
      next[dayIdx] = rebuildTransport(sorted);
      return next;
    });
    setToastMessage("시간이 변경되었어요.");
  };

  const allDayStops: ItineraryStop[][] = stopsPerDay.map((dayStops, dayIdx) =>
    dayStops.map((stop) => ({
      ...stop,
      onDelete: () => openDelete(dayIdx, stop.id),
      onTimeClick: () => openTime(dayIdx, stop.id, stop.time),
      onTimeConfirm: (time: string) => confirmTimeInline(dayIdx, stop.id, time),
      onAddPlace: (place: SearchPlace) => replaceStop(dayIdx, stop.id, place),
      onTransportClick: stop.transport ? () => openTransport(dayIdx, stop.id) : undefined,
      onVerify: stop.status === "verify" ? () => openVerify(dayIdx, stop.id) : undefined,
    })),
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
        <SlidingTimeline
          allDayStops={allDayStops}
          currentDay={currentDay}
          tripDates={tripDates}
          onAdd={() => {}}
          onDayChange={setCurrentDay}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      </PageCard>

      <ItineraryModals
        modal={modal}
        activeStop={activeStop}
        timeValue={timeValue}
        selectedRouteOptionId={selectedRouteOptionId}
        onClose={closeModal}
        onConfirmDelete={confirmDelete}
        onConfirmTime={confirmTime}
        onConfirmTransport={confirmTransport}
        onConfirmVerify={confirmVerify}
        onVerifyContinue={() => setToastMessage("관광지를 수집했어요!")}
        onTimeChange={setTimeValue}
        onOptimizeStart={() => setModal("optimizing")}
      />

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        icon={<SuccessIcon width={12} height={12} className="brightness-0 invert" aria-hidden />}
      />
    </div>
  );
}
