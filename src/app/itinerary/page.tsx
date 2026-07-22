"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SuccessIcon from "@/assets/icons/mypage/success.svg";
import { PageCard, Toast, EmptyState, LoadingState } from "@/components";
import { ItineraryHeader, SlidingTimeline, ItineraryModals } from "@/features/itinerary";
import type { ItineraryStop, ModalType } from "@/features/itinerary";
import { itineraryApi, travelLogApi, userApi } from "@/shared/api/domains";
import { useCollaborativeItinerary } from "@/features/itinerary/collab/useCollaborativeItinerary";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import {
  type BaseStop,
  buildDaysFromLog,
  mapItineraryDetailToDays,
  normalizeTime,
} from "@/features/itinerary/utils/scheduleUtils";
import { getTripTimeBounds } from "@/shared/utils/tripTimeBounds";
import type { SearchPlace } from "@/features/itinerary/components/PlaceSearchPanel";
import type { RouteOption } from "@/features/itinerary";
import type { ActivityAction, ActivityLogEntry } from "@/features/itinerary/collab/itineraryYjsSchema";

// 다른 참여자가 만든 변경을 토스트/안내팝업 메시지로 바꾸는 규칙. "누가 뭘 했는지"는
// activityLog 엔트리에서 그대로 나오고, 여기서는 문구만 고른다.
const ACTIVITY_MESSAGES: Record<ActivityAction, (entry: ActivityLogEntry) => string> = {
  add: (e) => `${e.actorName}님이 ${e.placeName}을(를) 추가했어요.`,
  delete: (e) => `${e.actorName}님이 ${e.placeName}을(를) 삭제했어요.`,
  time: (e) => `${e.actorName}님이 ${e.placeName}의 시간을 변경했어요.`,
  replace: (e) => `${e.actorName}님이 장소를 ${e.placeName}(으)로 바꿨어요.`,
  optimize: (e) => `${e.actorName}님이 일정을 최적화했어요.`,
  import: (e) => `${e.actorName}님이 다른 여행 기록을 불러왔어요.`,
};

function ItineraryEmptyState() {
  const router = useRouter();
  return (
    <PageCard>
      <EmptyState
        title="아직 여행 일정이 없어요"
        description={
          <>
            부지런즈와 함께
            <br />
            여행을 시작해볼까요?
          </>
        }
        actionLabel="여행 목록 보기"
        onAction={() => router.push("/itinerary/trips")}
      />
    </PageCard>
  );
}

function RouteLoadingFallback() {
  return (
    <PageCard>
      <LoadingState />
    </PageCard>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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

  if (isListLoading || isDetailLoading) {
    return (
      <PageCard>
        <LoadingState message="일정을 불러오는 중이에요" />
      </PageCard>
    );
  }
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
  // 인증하기(ArrivalVerifyModal)용 로그 ID. 홈 탭(useTodayItinerary)과 동일하게
  // 일정과 1:1로 연결된 로그를 itineraryId로 조회한다.
  const { data: verifyLog } = useQuery({
    queryKey: travelLogApi.keys.detail(itineraryId),
    queryFn: () => travelLogApi.getLog(itineraryId),
  });
  // 실시간 공동편집 프레즌스(누가 어떤 항목을 보고 있는지)에 내 이름/아바타를 알리는 용도.
  const { data: myProfile } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [peerUpdateMessage, setPeerUpdateMessage] = useState<string | undefined>(undefined);

  // 다른 참여자가 만든 변경(추가/삭제/시간변경/교체/최적화/로그 불러오기)을 알려준다.
  // "로그 불러오기"처럼 일정 전체가 바뀌는 큰 변경은 안내 팝업으로, 나머지는 토스트로.
  const handleRemoteActivity = (entry: ActivityLogEntry) => {
    const message = ACTIVITY_MESSAGES[entry.action]?.(entry) ?? `${entry.actorName}님이 일정을 변경했어요.`;
    if (entry.action === "import") {
      setPeerUpdateMessage(message);
      setModal("peerUpdate");
      window.setTimeout(() => {
        setModal((current) => (current === "peerUpdate" ? null : current));
      }, 1800);
      return;
    }
    setToastMessage(message);
  };

  const {
    stopsPerDay,
    collaboratorsByStop,
    setFocusedStop,
    logActivity,
    addStop: addYjsStop,
    deleteStop: deleteYjsStop,
    updateStopTime: updateYjsStopTime,
    replaceStop: replaceYjsStop,
    updateStopTransport: updateYjsStopTransport,
    updateStopStatus: updateYjsStopStatus,
    pushOptimizedOrder: pushYjsOptimizedOrder,
  } = useCollaborativeItinerary(
    itineraryId,
    dayIdsSliced,
    initialDays,
    myProfile?.id && myProfile.nickname
      ? { id: myProfile.id, nickname: myProfile.nickname, profileImageUrl: myProfile.profileImageUrl }
      : undefined,
    handleRemoteActivity,
  );
  const [tripDates, setTripDates] = useState<string[]>(initialDates);
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
    // 실제 itinerary의 day 수와 다를 수 있어(로그 쪽 day 수 기준), 존재하는 day에만 반영한다.
    days.forEach((dayStops, idx) => {
      if (idx < dayIdsSliced.length) pushYjsOptimizedOrder(idx, dayStops);
    });
    logActivity("import", "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTripDates(dates);
    setCurrentDay(0);
    const timer = window.setTimeout(() => {
      setToastMessage("일정이 추가되었어요.");
      window.history.replaceState(null, "", "/itinerary");
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (activeStopId) {
      logActivity("delete", activeStop?.placeName ?? "장소");
      deleteYjsStop(activeDayIdx, activeStopId);
    }
    closeModal();
    setToastMessage("장소가 삭제되었어요.");
  };
  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    const validationError = validateStopTime(activeDayIdx, timeStr);
    if (validationError) {
      setToastMessage(validationError);
      return;
    }
    if (activeStopId) {
      logActivity("time", activeStop?.placeName ?? "장소");
      updateYjsStopTime(activeDayIdx, activeStopId, timeStr);
    }
    closeModal();
    setToastMessage("시간이 변경되었어요.");
  };
  const confirmTransport = (option: RouteOption) => {
    setSelectedRouteOptionId(option.id);
    if (activeStopId && activeStop?.transport) {
      updateYjsStopTransport(activeDayIdx, activeStopId, {
        ...activeStop.transport,
        legs: option.legs,
        durationMin: option.durationMin,
        cost: option.cost,
      });
    }
    closeModal();
    setToastMessage("교통수단이 변경되었어요.");
  };
  const confirmVerify = () => {
    if (activeStopId) updateYjsStopStatus(activeDayIdx, activeStopId, "completed");
  };

  const startOptimize = async () => {
    setModal("optimizing");
    setOptimizeDone(false);
    const dayId = dayIdsSliced[currentDay];
    try {
      if (!dayId) throw new Error("dayId missing");
      const result = await itineraryApi.optimizeDay(dayId, {});
      // 응답에 item id가 없어 장소 이름으로 기존 stop을 찾아 순서/도착시간만 갱신한다.
      // 이름이 겹치는 스팟이 있어도 같은 stop을 두 번 재사용해 id가 중복되지 않도록,
      // 매칭된 stop은 remaining에서 바로 제거한다.
      const remaining = [...(stopsPerDay[currentDay] ?? [])];
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
      pushYjsOptimizedOrder(currentDay, reordered);
      logActivity("optimize", "");
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

  // PATCH로는 spotId(장소 자체)를 바꿀 수 없어서, 같은 위치에서 통째로 새 장소로 교체한다
  // (flush 시점에 delete+add로 반영됨 — flushItineraryToRest 참고).
  const replacePlace = (dayIdx: number, stopId: string, place: SearchPlace) => {
    const existingTime = stopsPerDay[dayIdx]?.find((s) => s.id === stopId)?.time ?? "00:00";
    replaceYjsStop(dayIdx, stopId, {
      id: `temp-${crypto.randomUUID()}`,
      spotId: place.id,
      time: existingTime,
      placeName: place.name,
      imageUrl: place.imageUrl,
      category: place.category,
      status: place.status === "completed" ? "completed" : "verify",
    });
    logActivity("replace", place.name);
    setToastMessage("관광지가 추가되었어요.");
  };

  const confirmTimeInline = (dayIdx: number, stopId: string, time: string) => {
    const validationError = validateStopTime(dayIdx, time);
    if (validationError) {
      setToastMessage(validationError);
      return;
    }
    logActivity("time", stopsPerDay[dayIdx]?.find((s) => s.id === stopId)?.placeName ?? "장소");
    updateYjsStopTime(dayIdx, stopId, time);
    setToastMessage("시간이 변경되었어요.");
  };

  const addNewStop = (dayIdx: number, place: SearchPlace) => {
    const newStop: BaseStop = {
      id: `temp-${crypto.randomUUID()}`,
      spotId: place.id,
      time: "00:00",
      placeName: place.name,
      imageUrl: place.imageUrl,
      category: place.category,
      status: place.status === "completed" ? "completed" : "verify",
    };
    logActivity("add", place.name);
    addYjsStop(dayIdx, newStop);
    setToastMessage("관광지가 추가되었어요.");
  };

  const allDayStops: ItineraryStop[][] = stopsPerDay.map((dayStops, dayIdx) =>
    dayStops.map((stop) => ({
      ...stop,
      activeEditors: collaboratorsByStop.get(`${dayIdx}:${stop.id}`) ?? [],
      onDelete: () => openDelete(dayIdx, stop.id),
      onTimeClick: () => openTime(dayIdx, stop.id, stop.time),
      onTimeConfirm: (time: string) => confirmTimeInline(dayIdx, stop.id, time),
      onAddPlace: (place: SearchPlace) => replacePlace(dayIdx, stop.id, place),
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
          onFocusChange={setFocusedStop}
        />
      </PageCard>

      <ItineraryModals
        modal={modal}
        activeStop={activeStop}
        itineraryId={itineraryId}
        logId={verifyLog?.id}
        timeValue={timeValue}
        selectedRouteOptionId={selectedRouteOptionId}
        peerUpdateMessage={peerUpdateMessage}
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
