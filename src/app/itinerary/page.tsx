"use client";

import { Suspense, useRef, useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import HotelIcon from "@/assets/icons/itinerary/hotel.svg?svgr";
import PencilIcon from "@/assets/icons/itinerary/pencil.svg?svgr";
import {
  PageCard,
  Toast,
  EmptyState,
  ErrorState,
  LoadingBoundary,
  LoadingState,
} from "@/components";
import {
  ItineraryHeader,
  SlidingTimeline,
  ItineraryModals,
  AccommodationSearchField,
  ItineraryFlowResumeBanner,
} from "@/features/itinerary";
import type { ItineraryStop, ModalType, AccommodationPlace } from "@/features/itinerary";
import { itineraryApi, travelLogApi, userApi } from "@/shared/api/domains";
import {
  useCollaborativeItinerary,
  type FlushErrorInfo,
} from "@/features/itinerary/collab/useCollaborativeItinerary";
import { useTransportBackfill } from "@/features/itinerary/hooks/useTransportBackfill";
import {
  type BaseStop,
  buildDaysFromTravelLogDetail,
  buildTransportFromItem,
  clampToTripBounds,
  getActiveTransportOptionId,
  mapItineraryDetailToDays,
  MAX_STOPS_PER_DAY,
  minutesToTime,
  normalizeTime,
  roundToNearest10,
  timeToMinutes,
  toBackendTravelMode,
  toHourMinute,
} from "@/features/itinerary/utils/scheduleUtils";
import type { TripTimeBounds } from "@/shared/utils/tripTimeBounds";
import {
  LAST_VIEWED_ITINERARY_EVENT,
  LAST_VIEWED_ITINERARY_KEY,
} from "@/shared/constants/itinerary";
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

// 상세 조회 실패를 "정말 없는 경우"와 "지금 못 불러온 경우"로 가른다. 상태 코드는 레포의
// 기존 방식(axios 에러의 response.status — join/[code], MypageProfile 등과 동일)으로 본다.
const DETAIL_RETRY_LIMIT = 2;

function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

// 404(없음)/403(참여자 아님)은 다시 물어도 답이 같고, 사용자에게 사실대로 알려줘야 한다.
function isItineraryGoneError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 404 || status === 403;
}

// 4xx는 재시도해도 결과가 같으니 즉시 포기하고, 5xx와 네트워크 오류(status를 못 얻는 경우)는
// 몇 번 다시 시도한다 — 이 백엔드는 일시적 503 이력이 있어서(generate 타임아웃 등) 한 번
// 흔들린 것만으로 멀쩡한 일정을 "삭제됨"으로 단정하면 안 된다.
function shouldRetryItineraryDetail(failureCount: number, error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < DETAIL_RETRY_LIMIT;
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
  const today = getLocalDateString();
  // 여행 목록 화면과 동일하게 종료일이 지난 일정은 메인 화면에서도 제외한다.
  // 날짜가 없는 기존 일정은 잘못 숨기지 않도록 후보에 남겨둔다.
  const visibleItineraries = itineraries.filter(
    (itinerary) => !itinerary.endAt || itinerary.endAt >= today,
  );

  const requested = visibleItineraries.find((itinerary) => itinerary.id === requestedTripId);
  if (requested) return requested;

  const ongoingToday = visibleItineraries.filter(
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

  const candidates = ongoingToday.length > 0 ? ongoingToday : visibleItineraries;
  return [...candidates].sort((a, b) => {
    const updatedDiff = getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;
    return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
  })[0];
}

function getDefaultStopTime(
  dayStops: BaseStop[],
  dayIdx: number,
  totalDays: number,
  bounds?: TripTimeBounds | null,
): string {
  if (dayStops.length === 0) {
    return minutesToTime(
      clampToTripBounds(timeToMinutes(DEFAULT_DAY_START), dayIdx, totalDays, bounds),
    );
  }
  const latestMin = Math.max(
    ...dayStops.map((stop) => {
      const [h, m] = stop.time.split(":").map(Number);
      return h * 60 + m;
    }),
  );
  // 이전 항목 시간이 (AI 생성 등으로) 10분 단위가 아니어도, 새로 추가되는 항목은
  // 항상 10분 단위에 맞추고, 여행 시작/종료 시간을 벗어나지 않게 한다.
  const nextMin = clampToTripBounds(
    Math.min(roundToNearest10(latestMin + DEFAULT_STOP_GAP_MIN), 23 * 60 + 59),
    dayIdx,
    totalDays,
    bounds,
  );
  return minutesToTime(findFreeMinute(nextMin, dayStops));
}

// 같은 날에 시간이 똑같은 항목이 두 개 생기지 않도록 비어 있는 10분 슬롯을 찾는다.
// 뒤로 밀다가 자정(23:50)에 닿으면 앞쪽으로 되돌아가며 찾는다(여행 종료 시간에 걸려
// 뒤가 막힌 경우).
function findFreeMinute(preferredMin: number, dayStops: BaseStop[]): number {
  const taken = new Set(dayStops.map((stop) => timeToMinutes(stop.time)));
  const LAST_MIN = 23 * 60 + 50;
  for (let candidate = preferredMin; candidate <= LAST_MIN; candidate += 10) {
    if (!taken.has(candidate)) return candidate;
  }
  for (let candidate = preferredMin - 10; candidate >= 0; candidate -= 10) {
    if (!taken.has(candidate)) return candidate;
  }
  return preferredMin;
}

// 최적화 결과 시각 사이에 두는 최소 간격과, minutesToTime이 잡는 하루 상한(23:59).
const MIN_STOP_GAP_MINUTES = 10;
const DAY_END_MINUTE = 23 * 60 + 59;

function resolveStopGap(count: number, lowerBound: number, upperBound: number): number {
  if (count < 2) return MIN_STOP_GAP_MINUTES;
  // 경계 폭이 좁아 10분씩 다 넣을 수 없으면 들어가는 만큼으로 간격을 좁힌다.
  return Math.min(MIN_STOP_GAP_MINUTES, Math.floor((upperBound - lowerBound) / (count - 1)));
}

// 최적화 응답의 도착 시각을 ① 여행 시작/종료 경계 안에서 ② 서로 다른 시각이 되도록 편다.
//
// clampToTripBounds는 경계 밖 값을 "잘라 붙이기"만 하므로 여러 스팟이 같은 시각으로 눌리고,
// 예전 구현처럼 그 뒤에 앞→뒤로만 밀면 두 가지가 다시 깨졌다.
//   - 마지막 날 종료가 18:00인데 18:00/18:10/18:20처럼 경계를 넘는다.
//   - minutesToTime이 23:59로 상한을 잡아서, 늦은 시각대에서는 밀어낸 값들이 다시 같은
//     23:59로 붙는다(= 막으려던 상태 그대로).
// 그래서 앞→뒤로 간격을 확보한 뒤, 상한에서 뒤→앞으로 되밀어 넘친 만큼을 앞쪽이 흡수한다.
// 되밀기는 간격을 유지한 채 내려오므로 경계와 "서로 다른 시각"을 동시에 만족한다.
// 같은 날 같은 시각은 백엔드가 400으로 막아(ItineraryService.validateArrivalTimeAvailable)
// 저장 자체가 실패하므로, 중복은 어떤 경우에도 남기지 않는다.
function spreadStopMinutes(rawMinutes: number[], lowerBound: number, upperBound: number): number[] {
  const count = rawMinutes.length;
  if (count === 0) return [];

  let lower = lowerBound;
  let upper = upperBound;
  let gap = resolveStopGap(count, lower, upper);
  // 간격을 1분도 낼 수 없는 경계(시작이 종료보다 늦게 저장된 일정 등)에서는 경계를 포기하고
  // 하루 전체에 편다 — 경계는 화면 규칙이지만 중복 시각은 저장 실패로 이어지기 때문이다.
  if (gap < 1) {
    lower = 0;
    upper = DAY_END_MINUTE;
    gap = Math.max(1, resolveStopGap(count, lower, upper));
  }

  // ① 앞 → 뒤: 최적화가 준 시각을 최대한 살리면서 하한부터 최소 간격을 확보한다.
  const spread: number[] = [];
  for (let idx = 0; idx < count; idx += 1) {
    const earliest = idx === 0 ? lower : spread[idx - 1] + gap;
    spread.push(Math.max(rawMinutes[idx], earliest));
  }

  // ② 뒤 → 앞: 상한부터 거꾸로 되밀어 경계를 넘은 만큼을 앞으로 흡수한다.
  spread[count - 1] = Math.min(spread[count - 1], upper);
  for (let idx = count - 2; idx >= 0; idx -= 1) {
    spread[idx] = Math.min(spread[idx], spread[idx + 1] - gap);
  }
  return spread;
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
      <ItineraryFlowResumeBanner />
      <EmptyState
        title="아직 여행 일정이 없어요"
        description={
          <>
            부지런즈와 함께
            <br />
            여행을 시작해볼까요?
          </>
        }
        primaryAction={{
          label: "여행 시작하기",
          onClick: () => router.push("/itinerary/trips/new"),
        }}
      />
    </PageCard>
  );
}

function RouteLoadingFallback() {
  return (
    <PageCard>
      <LoadingState variant="inline" />
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
  const router = useRouter();
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
  // tripId를 명시적으로 받았으면 목록에 아직 없어도 그 id를 그대로 연다. 확정 직후엔
  // 목록 응답에 새 일정이 아직 안 들어와 있는 경우가 있는데, 예전에는 그 id를 조용히
  // 버리고 "최근 수정" 일정으로 폴백해서 방금 만든 게 아닌 엉뚱한 일정이 열렸다
  // (새로고침해야 제대로 나오던 원인). 상세 조회가 실패하면 아래에서 안내한다.
  const itineraryId = requestedTripId ?? selectedItinerary?.id;

  useEffect(() => {
    if (!itineraryId) return;
    try {
      window.localStorage.setItem(LAST_VIEWED_ITINERARY_KEY, itineraryId);
      window.dispatchEvent(new Event(LAST_VIEWED_ITINERARY_EVENT));
    } catch {
      // 저장소 사용이 제한된 환경에서도 일정 자체는 정상 노출한다.
    }
  }, [itineraryId]);

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    isFetching: isDetailFetching,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: itineraryApi.keys.detail(itineraryId ?? ""),
    queryFn: () => itineraryApi.getItinerary(itineraryId as string),
    enabled: !!itineraryId,
    retry: shouldRetryItineraryDetail,
  });

  const isLoading = isListLoading || isDetailLoading;

  // 링크로 받은 tripId가 실제로 삭제됐거나 내 일정이 아닌 경우(404/403). 다른 일정을 대신
  // 열면 "내가 만든 일정이 아닌데 열렸다"가 되므로, 무엇이 일어났는지 알려준다.
  if (requestedTripId && isDetailError && isItineraryGoneError(detailError)) {
    return (
      <PageCard>
        <ItineraryFlowResumeBanner />
        <EmptyState
          title="일정을 찾을 수 없어요"
          description="삭제됐거나 참여 중이 아닌 일정이에요."
          primaryAction={{
            label: "여행 목록 보기",
            onClick: () => router.push("/itinerary/trips"),
          }}
        />
      </PageCard>
    );
  }

  // 그 밖의 실패(5xx·네트워크)는 일정이 없어진 게 아니라 지금 못 불러온 것뿐이다.
  // 자동 재시도를 다 쓴 뒤에도 사용자가 직접 다시 시도할 수 있어야 하므로 재조회 액션을 준다
  // (다시 시도 중에는 LoadingBoundary가 덮어서 "눌렀는데 반응이 없다"로 보이지 않게 한다).
  if (requestedTripId && isDetailError) {
    const status = getErrorStatus(detailError);
    return (
      <LoadingBoundary isLoading={isDetailFetching} message="일정을 불러오는 중이에요">
        <PageCard>
          <ItineraryFlowResumeBanner />
          <ErrorState
            // 설명 문구는 ErrorState의 상태코드 프리셋(500/503)을 그대로 쓴다 — 제목만
            // 이 화면 기준으로 바꿔서, 다른 화면의 오류 안내와 톤이 갈리지 않게 한다.
            code={status === 503 ? 503 : 500}
            title="일정을 불러오지 못했어요"
            primaryAction={{
              label: "다시 시도",
              onClick: () => {
                void refetchDetail();
              },
            }}
            secondaryAction={{
              label: "여행 목록 보기",
              onClick: () => router.push("/itinerary/trips"),
            }}
          />
        </PageCard>
      </LoadingBoundary>
    );
  }

  if (!itineraryId || !detail) {
    return (
      <LoadingBoundary isLoading={isLoading} message="일정을 불러오는 중이에요">
        <ItineraryEmptyState />
      </LoadingBoundary>
    );
  }

  // 시작/종료 시간, 숙소 전부 백엔드(Itinerary 엔티티)에 저장된 값을 그대로 쓴다.
  // 백엔드가 "HH:MM:SS"로 내려주므로 분까지만(HH:MM) 잘라서 쓴다.
  const tripTimeBounds =
    detail.startTime && detail.endTime
      ? {
          // 백엔드가 "09:20:00"처럼 초까지 내려주는 경우가 있어 "HH:mm"으로 맞춰서 쓴다.
          // 이 값이 타임라인 첫 항목 시간으로 그대로 노출되기도 해서(초까지 보이던 버그)
          // 여기서 한 번만 정규화하고 아래 비교/표시는 전부 이 값을 쓴다.
          startTime: toHourMinute(detail.startTime) ?? detail.startTime,
          endTime: toHourMinute(detail.endTime) ?? detail.endTime,
          accommodationName: detail.accommodationName,
          accommodationAddress: detail.accommodationAddress,
          accommodationLat: detail.accommodationLat,
          accommodationLng: detail.accommodationLng,
        }
      : null;
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

// 상세 조회 응답 타입 — 스키마가 바뀌어도 따라가도록 API 함수 반환 타입에서 뽑는다.
type ItineraryDetailData = Awaited<ReturnType<typeof itineraryApi.getItinerary>>;

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
  tripTimeBounds: TripTimeBounds | null;
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
  const { data: importedLog, isError: isImportedLogError } = useQuery({
    queryKey: travelLogApi.keys.detail(importedLogId ?? ""),
    queryFn: () => travelLogApi.getLog(importedLogId as string),
    enabled: !!importedLogId,
  });
  // 예전엔 URL의 `?days=`로 화면에 보여줄 날짜 수를 잘랐다. 잘린 날짜는 공동편집 문서에서도
  // 빠지는데, flush는 잘린 dayIds만 순회하며 그 day에 한해 "문서에 없고 서버에 있는 항목"을
  // 지우므로(flushDayToRest 참고) 잘린 날짜 자체는 애초에 flush 대상이 아니었다 — 즉 데이터가
  // 지워지는 문제는 아니었고, 화면에서만 뒷날짜가 사라져 편집이 불가능해지는 문제였다.
  // 레포에 `?days=` 링크가 남아 있지 않아 그대로 제거했고, 날짜 수는 항상 실제 일정 데이터를
  // 기준으로 삼는다.
  const initialDays = initialDaysData;
  const initialDates = initialDatesData;
  const dayIdsSliced = dayIds;
  // 확정 시점에 정한 시작/종료 시간 — 첫날은 시작 시간 이전, 마지막날은 종료 시간 이후로
  // 일정을 옮기지 못하게 막는 데 쓴다. 백엔드엔 시간이 저장되지 않아 로컬에만 있을 수 있다.
  const validateStopTime = (dayIdx: number, time: string): string | null => {
    if (!tripTimeBounds) return null;
    // 00:00은 "시간 미지정"으로 본다 — 표시 로직(scheduleUtils.boundMinutes)이 이미 그렇게
    // 취급하는데 여기서만 실제 자정으로 비교해서, 종료 시각이 00:00으로 저장된 일정은
    // 마지막 날 어떤 시각도 저장할 수 없었다(표시는 정상이라 이유를 알 수도 없었다).
    const startBound = tripTimeBounds.startTime === "00:00" ? undefined : tripTimeBounds.startTime;
    const endBound = tripTimeBounds.endTime === "00:00" ? undefined : tripTimeBounds.endTime;
    // 시작이 종료보다 늦게 저장된 일정(백엔드 검증이 없어 가능)에서는 두 조건을 동시에
    // 만족시킬 수 없어 아무 시각도 못 고치게 된다 — 이때는 경계 검증을 건너뛴다.
    const boundsInverted = !!startBound && !!endBound && startBound > endBound;
    if (boundsInverted) return null;

    if (dayIdx === 0 && startBound && time < startBound) {
      return `첫날 일정은 여행 시작 시간(${startBound}) 이후로만 설정할 수 있어요.`;
    }
    if (dayIdx === dayIdsSliced.length - 1 && endBound && time > endBound) {
      return `마지막날 일정은 여행 종료 시간(${endBound}) 이전으로만 설정할 수 있어요.`;
    }
    return null;
  };

  const findStopAtTime = (dayIdx: number, time: string, excludedStopId?: string) =>
    (stopsPerDay[dayIdx] ?? []).find((stop) => stop.id !== excludedStopId && stop.time === time);

  const [currentDay, setCurrentDay] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"default" | "error">("default");
  const [modal, setModal] = useState<ModalType | null>(null);
  const [peerUpdateMessage, setPeerUpdateMessage] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();
  const [accommodation, setAccommodation] = useState<AccommodationPlace | null>(
    tripTimeBounds?.accommodationName
      ? {
          name: tripTimeBounds.accommodationName,
          address: tripTimeBounds.accommodationAddress ?? "",
          lat: tripTimeBounds.accommodationLat,
          lng: tripTimeBounds.accommodationLng,
        }
      : null,
  );

  // TODO(백엔드 연동 예정): 숙소는 저장되지만 동선/시간 AI 최적화(onOptimizeClick,
  // ItineraryOptimizeRequest)엔 아직 반영 안 된다. 최적화 요청에 숙소 좌표를 출발/도착
  // 기준점으로 넘기려면 최적화 API에 좌표 필드 추가가 먼저 필요함.
  const handleAccommodationChange = (place: AccommodationPlace | null) => {
    const previous = accommodation;
    setAccommodation(place);

    // 화면의 숙소는 마운트 시점 상세 응답으로 초기화된다. 저장만 하고 상세 캐시를
    // 그대로 두면, 다른 화면에 갔다가 staleTime(60초) 안에 돌아왔을 때 옛 응답으로
    // 다시 초기화돼 방금 저장한 숙소가 사라진 것처럼 보였다.
    queryClient.setQueryData<ItineraryDetailData>(itineraryApi.keys.detail(itineraryId), (prev) =>
      prev
        ? {
            ...prev,
            accommodationName: place?.name ?? undefined,
            accommodationAddress: place?.address ?? undefined,
            accommodationLat: place?.lat,
            accommodationLng: place?.lng,
          }
        : prev,
    );

    itineraryApi
      .updateItinerary(itineraryId, {
        // 빈 문자열 = "지우기"를 명시적으로 보내는 신호. 필드 자체를 안 보내면(undefined)
        // JSON에서 키가 통째로 빠져서 백엔드가 "안 건드림"과 구분을 못 하기 때문에,
        // 지울 땐 null이 아니라 빈 문자열로 보낸다(백엔드에서 다시 null로 정규화함).
        accommodationName: place?.name ?? "",
        accommodationAddress: place?.address ?? "",
        accommodationLat: place?.lat,
        accommodationLng: place?.lng,
      })
      .then(() => {
        // 서버가 정규화한 값으로 최종 동기화.
        queryClient.invalidateQueries({ queryKey: itineraryApi.keys.detail(itineraryId) });
      })
      .catch(() => {
        // 저장이 실패했으면 화면도 되돌린다 — 안 되돌리면 저장된 것처럼 보인다.
        setAccommodation(previous);
        queryClient.invalidateQueries({ queryKey: itineraryApi.keys.detail(itineraryId) });
        showToast("숙소 정보를 저장하지 못했어요.", "error");
      });
  };

  const showToast = (message: string, variant: "default" | "error" = "default") => {
    setToastVariant(variant);
    setToastMessage(message);
  };

  // 화면(Yjs)에는 반영됐는데 DB 저장이 실패한 변경이 있을 때. 조용히 넘어가면 사용자는
  // 저장된 줄 알고 새로고침했다가 항목이 사라지는 걸 보게 된다.
  //
  // 자동 재시도가 남아 있는 동안(willRetry)에는 "아직 저장 안 됐고 다시 시도 중"이라는
  // 사실만 한 번 알린다 — 재시도마다 띄우면 곧 성공할 저장까지 실패로 보이기 때문에
  // 첫 실패(attempt===1)에서만 띄운다. 재시도까지 모두 실패한 최종 실패에서는 무엇이
  // 문제인지 알 수 있게 실패 사유(백엔드 message 우선)를 그대로 보여준다.
  const handleSaveFailed = (info: FlushErrorInfo) => {
    // 재시도가 남아 있으면 알리지 않는다. 곧 성공할 저장을 실패로 보여주면
    // 사용자가 같은 편집을 다시 하게 되고, 그게 중복 생성으로 이어졌다.
    // 더 시도할 게 없을 때만 실제 실패 사유를 띄운다.
    if (info.willRetry) return;
    showToast(info.message, "error");
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

  // 순서가 REST에 반영(flush 성공)될 때마다 올라가는 값. 비워진 구간의 교통수단을 다시
  // 계산해달라고 백엔드에 물어보는 시점을 여기에 맞춘다 — 백엔드는 DB의 order_index로
  // "직전 항목"을 찾기 때문에, 순서가 아직 저장되기 전에 물어보면 옛 순서 기준의 엉뚱한
  // 구간이 돌아온다(useTransportBackfill 주석 참고).
  const [transportSyncTick, setTransportSyncTick] = useState(0);

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
    replaceStopsWithImportedLog: replaceYjsStopsWithImportedLog,
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
    // 저장 실패는 예전엔 조용히 삼켜져서, 화면엔 바뀐 시간/순서가 보이는데 서버에는
    // 반영되지 않은 채 새로고침하면 되돌아갔다. 무엇을 언제 알릴지는 handleSaveFailed 참고.
    handleSaveFailed,
    // 저장이 끝나면 상세 캐시를 무효화한다. 저장 자체는 되는데 캐시(staleTime 60초)에
    // 옛 응답이 남아 있으면, 앱 안에서 이 화면에 다시 들어올 때 그 옛 응답으로 공동편집
    // 문서가 시딩돼 "바꾼 시간이 저장되지 않은 것처럼" 보였다(새로고침하면 캐시가 없어
    // 정상으로 보이던 이유).
    () => {
      queryClient.invalidateQueries({ queryKey: itineraryApi.keys.detail(itineraryId) });
      setTransportSyncTick((tick) => tick + 1);
    },
  );

  // 시각 변경으로 순서가 바뀌면 이웃이 달라진 구간의 교통수단 카드가 비워진다
  // (rebuildTransport가 가짜 역명을 만들지 않으려고 일부러 비운다). 그 구간만 골라 서버가
  // 계산한 실제 경로로 다시 채운다 — 로컬 state가 아니라 Yjs 문서에 써서 같이 보고 있는
  // 다른 참여자 화면에도 반영되게 한다.
  useTransportBackfill({
    itineraryId,
    dayIds: dayIdsSliced,
    stopsPerDay,
    syncTick: transportSyncTick,
    enabled: yjsSeeded,
    applyTransport: updateYjsStopTransport,
  });
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
    // pushYjsOptimizedOrder(재정렬 전용)는 "현재 배열에 이미 있는 id만" 반영하는 필터가
    // 있어서, 로그에서 새로 만들어진(한 번도 존재한 적 없는) id의 항목들을 넣으면 전부
    // 걸러져 day가 통째로 비어버렸다(2026-08-23 실서버 테스트로 재현). 로그 불러오기
    // 전용 함수로 교체.
    days.forEach((dayStops, idx) => {
      if (idx < dayIdsSliced.length) replaceYjsStopsWithImportedLog(idx, dayStops);
    });
    logActivity("import", "");
    flushNow();
    // 이 로그가 일정에 담긴 횟수(카운트 배지·인기순 정렬 기준)를 올린다. 실패해도 불러오기
    // 자체엔 지장 없으므로 조용히 삼킨다.
    travelLogApi.recordLogImport(importedLogId).catch(() => {});
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
    const conflict = findStopAtTime(activeDayIdx, timeStr, activeStopId ?? undefined);
    if (conflict) {
      showToast(`${conflict.placeName}과(와) 같은 시간이에요. 다른 시간을 골라주세요.`, "error");
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
  // 모달을 언제 닫을지는 TransportDetailModal이 "확인" 처리 결과(반환값)를 보고 스스로
  // 결정한다 — 여기서 closeModal()을 직접 부르면, 사용자가 확인을 누르기도 전에
  // (목록에서 옵션만 골랐을 뿐인데) 비동기 응답이 오는 시점에 모달이 제멋대로 닫혀버린다.
  // 성공 시 true, 실패/스킵 시 false를 반환해서 모달이 닫힐지 말지 결정하게 한다.
  const confirmTransport = async (option: RouteOption): Promise<boolean> => {
    const dayId = dayIdsSliced[activeDayIdx];
    const dayStops = stopsPerDay[activeDayIdx] ?? [];
    const activeIdx = dayStops.findIndex((s) => s.id === activeStopId);
    const nextStop = dayStops[activeIdx + 1];

    // transport는 항상 "다음 스팟까지의 구간" 정보라 nextStop 없이 존재할 수 없다.
    if (!activeStopId || !activeStop?.transport || !dayId || !nextStop) {
      showToast("교통수단을 변경할 수 없어요.", "error");
      return false;
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
      showToast("교통수단 변경에 실패했어요.", "error");
      return false;
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
      showToast("교통수단 변경에 실패했어요.", "error");
      return false;
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
      return true;
    }
    if (result.shiftedCount > 0) {
      showToast("교통수단이 변경돼서 이후 일정 시간도 조정됐어요.");
      return true;
    }

    showToast("교통수단이 변경되었어요.");
    return true;
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
      const optimizedSorted = (result.data?.spots ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      // optimized(travelMode/routeType/routeNo/역명/transitDetail)를 stop과 짝지어 들고
      // 있다가 transport를 만들 때 쓴다 — order/arrivalTime만 반영하면 최적화로 이동수단이
      // 바뀌어도 교통수단 배너가 최적화 전 값 그대로 남는다.
      const pairs = optimizedSorted
        .map((optimized) => {
          const matchIdx = remaining.findIndex((s) => s.placeName === optimized.name);
          const existing = matchIdx >= 0 ? remaining.splice(matchIdx, 1)[0] : remaining.shift();
          if (!existing) return null;
          return {
            optimized,
            // 경계 클램프는 여기서 하지 않는다 — 잘라 붙이면 여러 스팟이 같은 시각이 되고,
            // 그 뒤에 간격을 벌려도 경계를 다시 넘는다. 아래 spreadStopMinutes가 경계와
            // 최소 간격을 한 번에 해결하므로, 여기서는 응답 시각을 그대로 들고 간다.
            stop: {
              ...existing,
              time: normalizeTime(optimized.arrivalTime, existing.time),
            } as BaseStop,
          };
        })
        .filter(
          (p): p is { optimized: (typeof optimizedSorted)[number]; stop: BaseStop } => p !== null,
        );

      // 최적화는 여행 시작/종료 시각을 모른 채 계산하므로(백엔드가 09:00부터 계산한다)
      // 응답 시각이 경계 밖으로 나갈 수 있다. 경계 안으로 넣는 일과 "서로 다른 시각"을
      // 만드는 일을 한 번에 처리한다 — 자세한 근거는 spreadStopMinutes 주석 참고.
      const dayLowerBound = clampToTripBounds(0, currentDay, dayIdsSliced.length, tripTimeBounds);
      const dayUpperBound = clampToTripBounds(
        DAY_END_MINUTE,
        currentDay,
        dayIdsSliced.length,
        tripTimeBounds,
      );
      const spreadMinutes = spreadStopMinutes(
        pairs.map(({ stop }) => timeToMinutes(stop.time)),
        dayLowerBound,
        dayUpperBound,
      );
      pairs.forEach(({ stop }, idx) => {
        stop.time = minutesToTime(spreadMinutes[idx]);
      });

      // transport는 항상 "다음 스팟까지의 구간" 정보라, 각 스팟의 transport는 자신이 아니라
      // 바로 다음 스팟의 optimized 데이터(도착 항목이 이동수단을 들고 있는 컨벤션)로 만든다.
      const reordered = pairs.map(({ stop }, idx) => {
        const nextPair = pairs[idx + 1];
        if (!nextPair) return { ...stop, transport: undefined };
        const transport = buildTransportFromItem(
          nextPair.optimized,
          stop.placeName,
          nextPair.stop.placeName,
          nextPair.stop.id,
          nextPair.optimized.travelTimeMin ?? 30,
        );
        return { ...stop, transport };
      });
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
      category: place.collectionCategory,
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
    // 같은 날 같은 시간에 두 곳을 둘 수는 없다 — 순서가 뒤엉키고 이동수단 계산도 깨진다.
    const conflict = findStopAtTime(dayIdx, time, stopId);
    if (conflict) {
      showToast(`${conflict.placeName}과(와) 같은 시간이에요. 다른 시간을 골라주세요.`, "error");
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
    const defaultTime = getDefaultStopTime(
      stopsPerDay[dayIdx] ?? [],
      dayIdx,
      dayIdsSliced.length,
      tripTimeBounds,
    );
    const conflict = findStopAtTime(dayIdx, defaultTime);
    if (conflict) {
      showToast(
        `${conflict.placeName}과(와) 같은 시간이에요. 기존 일정의 시간을 먼저 변경해주세요.`,
        "error",
      );
      return;
    }
    const newStop: BaseStop = {
      id: `temp-${crypto.randomUUID()}`,
      spotId: place.id,
      time: defaultTime,
      placeName: place.name,
      imageUrl: place.imageUrl,
      category: place.collectionCategory,
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

  // 로그 담기는 "일정 상세 조회 → Yjs 시딩 → 반영"이 순서대로 끝나야 화면에 나온다.
  // 그동안 담기 전 타임라인이 그대로 보여서 "눌렀는데 아무 일도 안 일어난다"처럼 느껴졌다.
  // 그래서 로그 상세 응답(importedLog)이 도착하고 Yjs 시딩(yjsSeeded)이 끝날 때까지 로딩으로
  // 덮는다 — URL 정리와는 무관하다. 위 반영 이펙트가 history.replaceState로 주소만 바꾸는데,
  // 그건 Next의 searchParams를 갱신하지 않아 importedLogId는 언마운트까지 남아 있다.
  // 로그 조회가 실패하면(삭제된 로그 등) 담을 게 없으므로 로딩을 걷어낸다 —
  // 안 그러면 영영 안 끝나는 오버레이에 갇힌다.
  const isImportingLog = !!importedLogId && !isImportedLogError && (!importedLog || !yjsSeeded);

  return (
    <div className="relative h-full">
      {isImportingLog && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-main-white/90 backdrop-blur-sm">
          <LoadingState variant="inline" message="로그를 일정에 담고 있어요" />
        </div>
      )}
      <PageCard>
        <ItineraryFlowResumeBanner />
        <ItineraryHeader
          currentDay={currentDay}
          tripName={tripTitle ?? "부지렁즈"}
          onLogsClick={() => router.push("/itinerary/logs")}
          onOptimizeClick={() => setModal("optimize")}
          onTripsClick={() => router.push("/itinerary/trips")}
          onMembersClick={() => setModal("members")}
        />
        <AccommodationSearchField
          value={accommodation}
          onChange={handleAccommodationChange}
          renderTrigger={({ value: place, onOpen }) => (
            <div className="mb-3 flex items-center gap-2 rounded-[14px] border border-main-blue bg-system-navbg px-4 py-2">
              <HotelIcon width={14} height={14} className="shrink-0 fill-sub-gray" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-sub-deepgray">
                {place?.name ?? "숙소를 등록해보세요"}
              </span>
              <button
                type="button"
                onClick={onOpen}
                aria-label="숙소 수정"
                className="flex size-[20px] shrink-0 items-center justify-center rounded-md bg-main-blue active:opacity-70"
              >
                <PencilIcon width={12} height={12} className="fill-main-white" aria-hidden />
              </button>
            </div>
          )}
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
        accommodationName={accommodation?.name}
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
