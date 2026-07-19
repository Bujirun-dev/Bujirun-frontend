"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import travelImg from "@/assets/character/travel.png";
import SuccessIcon from "@/assets/icons/mypage/success.svg";
import { PageCard, Button, Toast } from "@/components";
import { ItineraryHeader, SlidingTimeline, ItineraryModals } from "@/features/itinerary";
import type { ItineraryStop, ModalType } from "@/features/itinerary";
import { itineraryApi } from "@/shared/api/domains";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import {
  type BaseStop,
  buildDaysFromLog,
  mapItineraryDetailToDays,
  nextTempStopId,
  normalizeTime,
  rebuildTransport,
} from "@/features/itinerary/utils/scheduleUtils";
import { getTripTimeBounds } from "@/shared/utils/tripTimeBounds";
import type { SearchPlace } from "@/features/itinerary/components/PlaceSearchPanel";
import type { RouteOption } from "@/features/itinerary";

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
  return (
    <Suspense fallback={null}>
      <ItineraryPageContent />
    </Suspense>
  );
}

function ItineraryPageContent() {
  const searchParams = useSearchParams();
  const requestedTripId = searchParams.get("tripId");

  const { data: itineraries, isLoading: isListLoading } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });

  // 목록에서 특정 여행을 골라 들어온 경우 그 tripId를 우선하고,
  // 하단 네비게이션처럼 지정 없이 들어온 경우에만 첫 번째 여행으로 대체한다.
  const selectedItinerary =
    itineraries?.find((itinerary) => itinerary.id === requestedTripId) ?? itineraries?.[0];
  const itineraryId = selectedItinerary?.id;

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: itineraryApi.keys.detail(itineraryId ?? ""),
    queryFn: () => itineraryApi.getItinerary(itineraryId as string),
    enabled: !!itineraryId,
  });

  if (isListLoading || isDetailLoading) return null;
  if (!itineraries || itineraries.length === 0 || !itineraryId || !detail) {
    return <ItineraryEmptyState />;
  }

  const tripTimeBounds = getTripTimeBounds(itineraryId);
  const { days, dates, dayIds } = mapItineraryDetailToDays(detail, tripTimeBounds);

  return (
    <ItineraryMain
      key={itineraryId}
      itineraryId={itineraryId}
      tripTitle={detail.title ?? selectedItinerary?.title}
      initialDays={days}
      initialDates={dates}
      dayIds={dayIds}
      tripTimeBounds={tripTimeBounds}
    />
  );
}

function ItineraryMain({
  itineraryId,
  tripTitle,
  initialDays: initialDaysData,
  initialDates: initialDatesData,
  dayIds,
  tripTimeBounds,
}: {
  itineraryId: string;
  tripTitle?: string;
  initialDays: BaseStop[][];
  initialDates: string[];
  dayIds: string[];
  tripTimeBounds: ReturnType<typeof getTripTimeBounds>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidateDetail = () =>
    queryClient.invalidateQueries({ queryKey: itineraryApi.keys.detail(itineraryId) });
  const searchParams = useSearchParams();
  const importedLogId = searchParams.get("importedLogId");
  const requestedDays = Math.max(1, Number(searchParams.get("days")) || initialDaysData.length);
  const initialDays = initialDaysData.slice(0, requestedDays);
  const initialDates = initialDatesData.slice(0, requestedDays);
  const dayIdsSliced = dayIds.slice(0, requestedDays);
  // 확정 시점에 정한 시작/종료 시간 — 첫날은 시작 시간 이전, 마지막날은 종료 시간 이후로
  // 일정을 옮기지 못하게 막는 데 쓴다. 백엔드엔 시간이 저장되지 않아 로컬에만 있을 수 있다.
  const validateStopTime = (dayIdx: number, time: string): string | null => {
    if (!tripTimeBounds) return null;
    if (dayIdx === 0 && tripTimeBounds.startTime && time < tripTimeBounds.startTime) {
      return `첫날 일정은 여행 시작 시간(${tripTimeBounds.startTime}) 이후로만 설정할 수 있어요.`;
    }
    if (
      dayIdx === dayIdsSliced.length - 1 &&
      tripTimeBounds.endTime &&
      time > tripTimeBounds.endTime
    ) {
      return `마지막날 일정은 여행 종료 시간(${tripTimeBounds.endTime}) 이전으로만 설정할 수 있어요.`;
    }
    return null;
  };

  const [currentDay, setCurrentDay] = useState(0);
  const [stopsPerDay, setStopsPerDay] = useState<BaseStop[][]>(initialDays);
  const [tripDates, setTripDates] = useState<string[]>(initialDates);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0 });
  const [selectedRouteOptionId, setSelectedRouteOptionId] = useState<string>("transit");
  const [optimizeDone, setOptimizeDone] = useState<boolean | undefined>(undefined);

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
    const dayId = dayIdsSliced[activeDayIdx];
    const stopId = activeStopId;
    setStopsPerDay((prev) => {
      const next = [...prev];
      next[activeDayIdx] = rebuildTransport(
        next[activeDayIdx].filter((s) => s.id !== activeStopId),
      );
      return next;
    });
    closeModal();
    setToastMessage("장소가 삭제되었어요.");
    if (dayId && stopId) {
      itineraryApi
        .deleteItem(itineraryId, dayId, stopId)
        .then(invalidateDetail)
        .catch(() => setToastMessage("삭제 저장에 실패했어요."));
    }
  };
  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    const validationError = validateStopTime(activeDayIdx, timeStr);
    if (validationError) {
      setToastMessage(validationError);
      return;
    }
    const dayId = dayIdsSliced[activeDayIdx];
    const stopId = activeStopId;
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
    if (dayId && stopId) {
      itineraryApi
        .updateItem(itineraryId, dayId, stopId, { arrivalTime: timeStr })
        .then(invalidateDetail)
        .catch(() => setToastMessage("시간 변경 저장에 실패했어요."));
    }
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

  const startOptimize = async () => {
    setModal("optimizing");
    setOptimizeDone(false);
    const dayId = dayIdsSliced[currentDay];
    try {
      if (!dayId) throw new Error("dayId missing");
      const result = await itineraryApi.optimizeDay(dayId, {});
      invalidateDetail();
      // 응답에 item id가 없어 장소 이름으로 기존 stop을 찾아 순서/도착시간만 갱신한다.
      setStopsPerDay((prev) => {
        const next = [...prev];
        const currentStops = next[currentDay];
        // 이름이 겹치는 스팟이 있어도 같은 stop을 두 번 재사용해 id가 중복되지 않도록,
        // 매칭된 stop은 remaining에서 바로 제거한다.
        const remaining = [...currentStops];
        const reordered = (result.data?.spots ?? [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((optimized) => {
            const matchIdx = remaining.findIndex((s) => s.placeName === optimized.name);
            const existing = matchIdx >= 0 ? remaining.splice(matchIdx, 1)[0] : remaining.shift();
            return existing
              ? { ...existing, time: normalizeTime(optimized.arrivalTime, existing.time) }
              : null;
          })
          .filter((s): s is BaseStop => s !== null);
        next[currentDay] = rebuildTransport(reordered);
        return next;
      });
      setToastMessage("일정이 최적화됐어요.");
    } catch {
      setToastMessage("일정 최적화에 실패했어요.");
    } finally {
      setOptimizeDone(true);
    }
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
    const existingTime = stopsPerDay[dayIdx]?.find((s) => s.id === stopId)?.time;
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

    // PATCH로는 spotId(장소 자체)를 바꿀 수 없어서, 기존 항목 삭제 후 새 장소로 다시 추가하는 방식으로 처리
    const dayId = dayIdsSliced[dayIdx];
    if (!dayId) return;
    itineraryApi
      .deleteItem(itineraryId, dayId, stopId)
      .catch(() => {})
      .then(() =>
        itineraryApi.addItem(itineraryId, dayId, { spotId: place.id, arrivalTime: existingTime }),
      )
      .then((newItem) => {
        if (!newItem?.id) return;
        setStopsPerDay((prev) => {
          const next = [...prev];
          next[dayIdx] = next[dayIdx].map((s) => (s.id === stopId ? { ...s, id: newItem.id! } : s));
          return next;
        });
        invalidateDetail();
      })
      .catch(() => setToastMessage("장소 변경 저장에 실패했어요."));
  };

  const confirmTimeInline = (dayIdx: number, stopId: string, time: string) => {
    const validationError = validateStopTime(dayIdx, time);
    if (validationError) {
      setToastMessage(validationError);
      return;
    }
    setStopsPerDay((prev) => {
      const next = [...prev];
      const sorted = [...next[dayIdx]]
        .map((s) => (s.id === stopId ? { ...s, time } : s))
        .sort((a, b) => a.time.localeCompare(b.time));
      next[dayIdx] = rebuildTransport(sorted);
      return next;
    });
    setToastMessage("시간이 변경되었어요.");

    const dayId = dayIdsSliced[dayIdx];
    if (dayId) {
      itineraryApi
        .updateItem(itineraryId, dayId, stopId, { arrivalTime: time })
        .then(invalidateDetail)
        .catch(() => setToastMessage("시간 변경 저장에 실패했어요."));
    }
  };

  const addNewStop = (dayIdx: number, place: SearchPlace) => {
    const tempId = nextTempStopId();
    const newStop: BaseStop = {
      id: tempId,
      time: "00:00",
      placeName: place.name,
      imageUrl: place.imageUrl,
      category: place.category,
      status: place.status === "completed" ? "completed" : "verify",
    };
    const orderIndex = stopsPerDay[dayIdx]?.length ?? 0;

    setStopsPerDay((prev) => {
      const next = [...prev];
      next[dayIdx] = rebuildTransport([...next[dayIdx], newStop]);
      return next;
    });
    setToastMessage("관광지가 추가되었어요.");

    const dayId = dayIdsSliced[dayIdx];
    if (!dayId) return;
    itineraryApi
      .addItem(itineraryId, dayId, { spotId: place.id, arrivalTime: "00:00", orderIndex })
      .then((newItem) => {
        if (!newItem?.id) return;
        setStopsPerDay((prev) => {
          const next = [...prev];
          next[dayIdx] = next[dayIdx].map((s) => (s.id === tempId ? { ...s, id: newItem.id! } : s));
          return next;
        });
        invalidateDetail();
      })
      .catch(() => setToastMessage("장소 추가 저장에 실패했어요."));
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

  return (
    <div className="relative h-full">
      <PageCard>
        <ItineraryHeader
          currentDay={currentDay}
          tripName={tripTitle ?? "부지렁즈"}
          onLogsClick={() => router.push("/itinerary/logs")}
          onOptimizeClick={() => setModal("optimize")}
          onTripsClick={() => router.push("/itinerary/trips")}
        />
        <SlidingTimeline
          allDayStops={allDayStops}
          currentDay={currentDay}
          tripDates={tripDates}
          onAddNewPlace={addNewStop}
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
        onOptimizeStart={startOptimize}
        isOptimizeDone={optimizeDone}
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
