"use client";

import { Suspense, useRef, useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageCard, Toast, EmptyState, LoadingBoundary, LoadingState } from "@/components";
import { ItineraryHeader, SlidingTimeline, ItineraryModals } from "@/features/itinerary";
import type { ItineraryStop, ModalType } from "@/features/itinerary";
import { itineraryApi, travelLogApi, userApi } from "@/shared/api/domains";
import { useCollaborativeItinerary } from "@/features/itinerary/collab/useCollaborativeItinerary";
import {
  type BaseStop,
  buildDaysFromTravelLogDetail,
  buildTransportFromItem,
  getActiveTransportOptionId,
  mapItineraryDetailToDays,
  MAX_STOPS_PER_DAY,
  normalizeTime,
  roundToNearest10,
  timeToMinutes,
  toBackendTravelMode,
} from "@/features/itinerary/utils/scheduleUtils";
import { getTripTimeBounds } from "@/shared/utils/tripTimeBounds";
import type { SearchPlace } from "@/components/place/PlaceSearchPanel";
import type { RouteOption } from "@/features/itinerary";
import type {
  ActivityAction,
  ActivityLogEntry,
} from "@/features/itinerary/collab/itineraryYjsSchema";

// 관광지를 새로 추가할 때 시간 기본값 — 매번 00:00부터 휠을 돌려 맞춰야 하는 불편을
// 줄이기 위해, 그 날 마지막 일정 다음 시간(1시간 뒤)으로 잡아준다. 비어있는 날은 09:00부터.
const DEFAULT_DAY_START = "09:00";
const DEFAULT_STOP_GAP_MIN = 60;
const LAST_VIEWED_ITINERARY_KEY = "bujirun:last-viewed-itinerary-id";
const LAST_VIEWED_ITINERARY_EVENT = "bujirun:last-viewed-itinerary-change";

interface ItinerarySummaryForSelection {
  id?: string;
  startAt?: string;
  endAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimestamp(value?: string): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function subscribeToLastViewedItinerary(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LAST_VIEWED_ITINERARY_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LAST_VIEWED_ITINERARY_EVENT, onStoreChange);
  };
}

function getLastViewedItinerarySnapshot(): string | null {
  try {
    return window.localStorage.getItem(LAST_VIEWED_ITINERARY_KEY);
  } catch {
    return null;
  }
}

function getLastViewedItineraryServerSnapshot(): null {
  return null;
}

function selectItinerary<T extends ItinerarySummaryForSelection>(
  itineraries: T[],
  requestedTripId: string | null,
  lastViewedItineraryId: string | null,
): T | undefined {
  const requested = itineraries.find((itinerary) => itinerary.id === requestedTripId);
  if (requested) return requested;

  const today = getLocalDateString();
  const ongoingToday = itineraries.filter(
    (itinerary) =>
      !!itinerary.startAt &&
      !!itinerary.endAt &&
      itinerary.startAt <= today &&
      today <= itinerary.endAt,
  );

  if (ongoingToday.length > 0) {
    const lastViewed = ongoingToday.find((itinerary) => itinerary.id === lastViewedItineraryId);
    if (lastViewed) return lastViewed;
  }

  const candidates = ongoingToday.length > 0 ? ongoingToday : itineraries;
  return [...candidates].sort((a, b) => {
    const updatedDiff = getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;
    return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
  })[0];
}

function getDefaultStopTime(dayStops: BaseStop[]): string {
  if (dayStops.length === 0) return DEFAULT_DAY_START;
  const latestMin = Math.max(
    ...dayStops.map((stop) => {
      const [h, m] = stop.time.split(":").map(Number);
      return h * 60 + m;
    }),
  );
  const nextMin = Math.min(latestMin + DEFAULT_STOP_GAP_MIN, 23 * 60 + 59);
  const hh = String(Math.floor(nextMin / 60)).padStart(2, "0");
  const mm = String(nextMin % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

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
  const lastViewedItineraryId = useSyncExternalStore(
    subscribeToLastViewedItinerary,
    getLastViewedItinerarySnapshot,
    getLastViewedItineraryServerSnapshot,
  );

  const { data: itineraries, isLoading: isListLoading } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });

  // 목록에서 직접 선택한 일정이 최우선. 하단 탭처럼 지정 없이 들어오면 오늘 진행 중인
  // 일정 → 최근 수정 → 최근 생성 순으로 고르고, 오늘 일정이 여러 개면 마지막 조회 일정을
  // 먼저 보여준다.
  const selectedItinerary = itineraries
    ? selectItinerary(itineraries, requestedTripId, lastViewedItineraryId)
    : undefined;
  const itineraryId = selectedItinerary?.id;

  useEffect(() => {
    if (!itineraryId) return;
    try {
      window.localStorage.setItem(LAST_VIEWED_ITINERARY_KEY, itineraryId);
      window.dispatchEvent(new Event(LAST_VIEWED_ITINERARY_EVENT));
    } catch {
      // 저장소 사용이 제한된 환경에서도 일정 자체는 정상 노출한다.
    }
  }, [itineraryId]);

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: itineraryApi.keys.detail(itineraryId ?? ""),
    queryFn: () => itineraryApi.getItinerary(itineraryId as string),
    enabled: !!itineraryId,
  });

  const isLoading = isListLoading || isDetailLoading;

  if (!itineraries || itineraries.length === 0 || !itineraryId || !detail) {
    return (
      <LoadingBoundary isLoading={isLoading} message="일정을 불러오는 중이에요">
        <ItineraryEmptyState />
      </LoadingBoundary>
    );
  }

  const tripTimeBounds = getTripTimeBounds(itineraryId);
  const { days, dates, dayIds } = mapItineraryDetailToDays(detail, tripTimeBounds);

  return (
    <LoadingBoundary isLoading={isLoading} message="일정을 불러오는 중이에요">
      <ItineraryMain
        key={itineraryId}
        itineraryId={itineraryId}
        groupId={detail.groupId}
        tripTitle={detail.title ?? selectedItinerary?.title}
        initialDays={days}
        initialDates={dates}
        dayIds={dayIds}
        tripTimeBounds={tripTimeBounds}
      />
    </LoadingBoundary>
  );
}

function ItineraryMain({
  itineraryId,
  groupId,
  tripTitle,
  initialDays: initialDaysData,
  initialDates: initialDatesData,
  dayIds,
  tripTimeBounds,
}: {
  itineraryId: string;
  groupId?: string;
  tripTitle?: string;
  initialDays: BaseStop[][];
  initialDates: string[];
  dayIds: string[];
  tripTimeBounds: ReturnType<typeof getTripTimeBounds>;
}) {
  const router = useRouter();
  // 실시간 공동편집 프레즌스(누가 어떤 항목을 보고 있는지)에 내 이름/아바타를 알리는 용도.
  const { data: myProfile } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });
  const searchParams = useSearchParams();
  const importedLogId = searchParams.get("importedLogId");
  // 다른 사람의 여행 로그를 이 일정에 그대로 불러오는 기능(로그 상세 페이지의 "일정 담기").
  const { data: importedLog } = useQuery({
    queryKey: travelLogApi.keys.detail(importedLogId ?? ""),
    queryFn: () => travelLogApi.getLog(importedLogId as string),
    enabled: !!importedLogId,
  });
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
  const [toastVariant, setToastVariant] = useState<"default" | "error">("default");
  const [modal, setModal] = useState<ModalType | null>(null);
  const [peerUpdateMessage, setPeerUpdateMessage] = useState<string | undefined>(undefined);

  const showToast = (message: string, variant: "default" | "error" = "default") => {
    setToastVariant(variant);
    setToastMessage(message);
  };

  // 다른 참여자가 만든 변경(추가/삭제/시간변경/교체/최적화/로그 불러오기)을 알려준다.
  // "로그 불러오기"처럼 일정 전체가 바뀌는 큰 변경은 안내 팝업으로, 나머지는 토스트로.
  const handleRemoteActivity = (entry: ActivityLogEntry) => {
    const message =
      ACTIVITY_MESSAGES[entry.action]?.(entry) ?? `${entry.actorName}님이 일정을 변경했어요.`;
    if (entry.action === "import") {
      setPeerUpdateMessage(message);
      setModal("peerUpdate");
      window.setTimeout(() => {
        setModal((current) => (current === "peerUpdate" ? null : current));
      }, 1800);
      return;
    }
    showToast(message);
  };

  const {
    stopsPerDay,
    seeded: yjsSeeded,
    collaboratorsByStop,
    setFocusedStop,
    logActivity,
    flushNow,
    addStop: addYjsStop,
    deleteStop: deleteYjsStop,
    updateStopTime: updateYjsStopTime,
    replaceStop: replaceYjsStop,
    updateStopTransport: updateYjsStopTransport,
    updateStopStatus: updateYjsStopStatus,
    pushOptimizedOrder: pushYjsOptimizedOrder,
    shiftFollowingStopTimes: shiftYjsFollowingStopTimes,
  } = useCollaborativeItinerary(
    itineraryId,
    dayIdsSliced,
    initialDays,
    myProfile?.id && myProfile.nickname
      ? {
          id: myProfile.id,
          nickname: myProfile.nickname,
          profileImageUrl: myProfile.profileImageUrl,
        }
      : undefined,
    handleRemoteActivity,
  );
  const [tripDates, setTripDates] = useState<string[]>(initialDates);
  // initialDates는 마운트 시점 값을 useState 시드로만 쓰기 때문에, 트립 목록 화면에서
  // 여행 날짜를 수정해 detail이 리페치돼도 그 자체로는 반영되지 않는다(같은 itineraryId면
  // 리마운트도 안 됨). 값이 실제로 바뀔 때만 다시 동기화한다.
  const initialDatesKey = initialDates.join(",");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTripDates(initialDates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDatesKey]);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [timeValue, setTimeValue] = useState({ hour: 12, minute: 0 });
  const [optimizeDone, setOptimizeDone] = useState<boolean | undefined>(undefined);

  const touchStartX = useRef(0);

  useEffect(() => {
    if (!importedLogId || !importedLog) return;
    // Yjs 문서가 아직 시딩 전이면 day별 items 배열 자체가 doc 안에 없어서, 이 시점에
    // pushYjsOptimizedOrder를 호출해도 조용히 아무 일도 안 일어난다(day map을 못 찾아
    // no-op) — "로그 불러오기 버튼을 눌러도 일정이 그대로"인 버그의 원인이었다. seeded가
    // true가 될 때(=day 구조가 doc에 만들어진 뒤)까지 기다렸다가 반영한다.
    if (!yjsSeeded) return;

    // 로그 응답의 각 항목에 spotId/주소/썸네일/카테고리가 이미 내려오므로 그대로 쓴다
    // (예전엔 이름으로 관광지를 다시 검색해 매칭했었는데, 백엔드가 spotId를 내려주기
    // 시작한 뒤에도 안 지워져 있던 워크어라운드였음 — 이름이 안 맞으면 엉뚱한 스팟에
    // 매칭되거나 spotId가 비어 REST addItem 저장 자체가 안 되는 문제가 있었음).
    const { days } = buildDaysFromTravelLogDetail(importedLog);
    // 로그 쪽 day 수가 현재 일정보다 적을 수 있다(예: 2박3일 일정에 1박2일 로그를 불러오는
    // 경우) — 그럴 땐 로그가 채워주는 날짜까지만 덮어쓰고, 남는 뒷날은 원래 상태(대개 빈
    // 상태) 그대로 둔다. 로그 쪽 day 수가 더 많으면 초과분은 그냥 버린다(현재 일정 기준).
    // 여행 날짜(tripDates)는 로그가 아니라 지금 이 일정 고유의 값이라 손대지 않는다 —
    // 예전엔 로그의 dates로 덮어써서, 일정보다 짧은 로그를 불러오면 뒷날짜 자체가
    // 화면에서 통째로 사라지는(사실상 일정이 로그 길이로 줄어드는) 버그가 있었다.
    days.forEach((dayStops, idx) => {
      if (idx < dayIdsSliced.length) pushYjsOptimizedOrder(idx, dayStops);
    });
    logActivity("import", "");
    flushNow();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDay(0);
    const toastTimer = window.setTimeout(() => {
      showToast("일정이 추가되었어요.");
      window.history.replaceState(null, "", "/itinerary");
    }, 300);

    return () => {
      window.clearTimeout(toastTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedLogId, importedLog, yjsSeeded]);

  const activeStop = stopsPerDay[activeDayIdx]?.find((s) => s.id === activeStopId);
  const selectedRouteOptionId = getActiveTransportOptionId(activeStop);

  // 이동수단 변경 모달을 열 때만 후보(지하철 전용/버스 전용/버스+지하철 조합/도보/택시)와
  // 각각의 실제 요금·소요시간을 조회한다 — 확정 전 미리보기라 매번 새로 계산된 값이 필요하다.
  //
  // ItineraryItem은 "직전 항목 → 이 항목" 도착 구간 정보를 자기 자신에 저장하는 컨벤션이라
  // (addItem/optimize/saveConfirmedItinerary 전부 동일), travel-mode 조회/변경 API는 activeStop
  // 자신의 id가 아니라 "다음 항목"의 id를 받아야 한다. activeStopId를 그대로 넘기면 백엔드가
  // "이 항목의 이전 항목"을 찾아 엉뚱한 구간을 계산하고, activeStop이 그 day의 첫 항목이면
  // "첫 번째 방문 항목은 이동수단 옵션이 없습니다"를 잘못 던진다(2026-08-19 버그 리포트).
  const travelModeOptionsDayId = dayIdsSliced[activeDayIdx];
  const travelModeTargetItemId = activeStop?.transport?.toStopId;
  const { data: travelModeOptions } = useQuery({
    queryKey: itineraryApi.keys.travelModeOptions(
      itineraryId ?? "",
      travelModeOptionsDayId ?? "",
      travelModeTargetItemId ?? "",
    ),
    queryFn: () =>
      itineraryApi.getTravelModeOptions(
        itineraryId as string,
        travelModeOptionsDayId as string,
        travelModeTargetItemId as string,
      ),
    enabled:
      modal === "transport" &&
      !!itineraryId &&
      !!travelModeOptionsDayId &&
      !!travelModeTargetItemId,
  });
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
    showToast("장소가 삭제되었어요.", "error");
  };
  const confirmTime = () => {
    const timeStr = `${String(timeValue.hour).padStart(2, "0")}:${String(timeValue.minute).padStart(2, "0")}`;
    const validationError = validateStopTime(activeDayIdx, timeStr);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    if (activeStopId) {
      logActivity("time", activeStop?.placeName ?? "장소");
      updateYjsStopTime(activeDayIdx, activeStopId, timeStr);
    }
    closeModal();
    showToast("시간이 변경되었어요.");
  };
  // 이동수단 변경은 프론트에서 소요시간/역명을 추정하지 않고, 백엔드가 ODsay로 실제
  // 재계산한 경로(진짜 역명·노선번호)를 받아와 반영한다 — 예전엔 로컬에서 "장소명역" 같은
  // 이름을 지어내서 실제로 존재하지 않는 역이 표시되는 문제가 있었다.
  const confirmTransport = async (option: RouteOption) => {
    const dayId = dayIdsSliced[activeDayIdx];
    const dayStops = stopsPerDay[activeDayIdx] ?? [];
    const activeIdx = dayStops.findIndex((s) => s.id === activeStopId);
    const nextStop = dayStops[activeIdx + 1];

    // transport는 항상 "다음 스팟까지의 구간" 정보라 nextStop 없이 존재할 수 없다 —
    // 여기 안 걸리면 그냥 아무 것도 안 하고 닫는다.
    if (!activeStopId || !activeStop?.transport || !dayId || !nextStop) {
      closeModal();
      return;
    }

    let updatedItem;
    try {
      // option.id는 화면 구분용 값(walk/taxi/bus/subway/combo)이라 백엔드 travelMode
      // (walk/transit/taxi)와 다르다 — toBackendTravelMode()로 변환 후 전송한다.
      // itemId는 activeStopId(출발 항목)가 아니라 nextStop.id(도착 항목) — ItineraryItem은
      // "직전 항목 → 이 항목" 구간 정보를 도착 항목 자신에 저장하는 컨벤션이라, 백엔드가
      // 재계산할 대상은 항상 도착 항목이다.
      updatedItem = await itineraryApi.updateTravelMode(itineraryId, dayId, nextStop.id, {
        travelMode: toBackendTravelMode(option.id),
      });
    } catch {
      closeModal();
      showToast("교통수단 변경에 실패했어요.", "error");
      return;
    }

    const transport = buildTransportFromItem(
      updatedItem,
      activeStop.placeName,
      nextStop.placeName,
      nextStop.id,
      option.durationMin,
      option.cost,
    );
    if (!transport) {
      closeModal();
      showToast("교통수단 변경에 실패했어요.", "error");
      return;
    }
    updateYjsStopTransport(activeDayIdx, activeStopId, transport);

    // 소요시간이 바뀐 만큼 다음 스팟부터 그날 남은 일정 시간을 밀어준다 —
    // 사용자가 직접 시간을 정해둔 스팟을 만나거나 여행 종료 시간을 넘기면 거기서 멈춘다.
    const newNextMinutes = roundToNearest10(timeToMinutes(activeStop.time) + transport.durationMin);
    const delta = newNextMinutes - timeToMinutes(nextStop.time);
    const isLastDay = activeDayIdx === dayIdsSliced.length - 1;
    const boundaryMinutes =
      isLastDay && tripTimeBounds?.endTime ? timeToMinutes(tripTimeBounds.endTime) : undefined;

    const result = shiftYjsFollowingStopTimes(activeDayIdx, activeStopId, delta, boundaryMinutes);

    if (result.cappedAtBoundary) {
      showToast(
        "교통수단은 바뀌었지만, 여행 종료 시간을 넘어서 일부 일정은 자동으로 조정하지 못했어요.",
        "error",
      );
      closeModal();
      return;
    }
    if (result.shiftedCount > 0) {
      showToast("교통수단이 변경돼서 이후 일정 시간도 조정됐어요.");
      closeModal();
      return;
    }

    closeModal();
    showToast("교통수단이 변경되었어요.");
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
      showToast("일정이 최적화됐어요.");
    } catch {
      showToast("일정 최적화에 실패했어요.", "error");
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
    showToast("관광지가 추가되었어요.");
  };

  const confirmTimeInline = (dayIdx: number, stopId: string, time: string) => {
    const validationError = validateStopTime(dayIdx, time);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    logActivity("time", stopsPerDay[dayIdx]?.find((s) => s.id === stopId)?.placeName ?? "장소");
    updateYjsStopTime(dayIdx, stopId, time);
    showToast("시간이 변경되었어요.");
  };

  const addNewStop = (dayIdx: number, place: SearchPlace) => {
    // "+" 버튼은 10개가 차면 미리 숨기지만(ItineraryTimeline), 다른 참여자가 실시간으로
    // 거의 동시에 채워 넣는 경우처럼 그 사이 정원이 찼을 수 있어 여기서도 한 번 더 막는다.
    // 여길 통과해도 최종 판단은 항상 백엔드(addItem)가 한다.
    if ((stopsPerDay[dayIdx]?.length ?? 0) >= MAX_STOPS_PER_DAY) {
      showToast(
        `하루 일정에는 관광지를 최대 ${MAX_STOPS_PER_DAY}개까지만 추가할 수 있어요.`,
        "error",
      );
      return;
    }
    const newStop: BaseStop = {
      id: `temp-${crypto.randomUUID()}`,
      spotId: place.id,
      time: getDefaultStopTime(stopsPerDay[dayIdx] ?? []),
      placeName: place.name,
      imageUrl: place.imageUrl,
      category: place.category,
      status: place.status === "completed" ? "completed" : "verify",
    };
    logActivity("add", place.name);
    addYjsStop(dayIdx, newStop);
    showToast("관광지가 추가되었어요.");
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
          onMembersClick={() => setModal("members")}
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
        groupId={groupId}
        travelModeOptions={travelModeOptions}
        timeValue={timeValue}
        selectedRouteOptionId={selectedRouteOptionId}
        peerUpdateMessage={peerUpdateMessage}
        onClose={closeModal}
        onConfirmDelete={confirmDelete}
        onConfirmTime={confirmTime}
        onConfirmTransport={confirmTransport}
        onConfirmVerify={confirmVerify}
        onVerifyContinue={() => showToast("관광지를 수집했어요!")}
        onTimeChange={setTimeValue}
        onOptimizeStart={startOptimize}
        isOptimizeDone={optimizeDone}
      />

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        variant={toastVariant}
      />
    </div>
  );
}
