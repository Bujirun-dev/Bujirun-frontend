import type { ItineraryStop, RouteOption } from "../components";
import { getCategoryFromKo } from "@/shared/constants/category";
import type { components } from "@/shared/api/schema";

type ItineraryDetailResponse = components["schemas"]["ItineraryDetailResponse"];
type TravelLogDetailResponse = components["schemas"]["TravelLogDetailResponse"];
export type SpotSearchResponse = components["schemas"]["SpotSearchResponse"];

// 서버 응답을 받기 전까지 로컬 state에서 새 항목을 식별하기 위한 임시 id (Date.now/crypto 같은
// impure 호출을 렌더 함수 안에서 쓰지 않도록 모듈 스코프 카운터로 대체).
let tempStopIdCounter = 0;
export function nextTempStopId(): string {
  tempStopIdCounter += 1;
  return `temp-${tempStopIdCounter}`;
}

export const FALLBACK_IMAGE = "https://picsum.photos/seed/busan/300/200";

type TransportType = "버스" | "지하철" | "도보" | "택시";

export type BaseStop = Omit<
  ItineraryStop,
  "onDelete" | "onClick" | "onTimeClick" | "onTimeConfirm" | "onTransportClick" | "onVerify"
>;

export function getTransportPointName(type: TransportType, placeName: string): string {
  if (type === "버스") return `${placeName} 인근 정류장`;
  if (type === "지하철") return `${placeName}역`;
  return placeName;
}

// GET /api/logs/{id}(다른 사람의 여행 로그) 응답을 타임라인 UI가 쓰는 BaseStop[][]로
// 변환한다. 실제 로그엔 spotId/주소/영업시간 같은 상세 정보가 없어서(스팟 이름만 내려옴)
// mapItineraryDetailToDays와 동일하게 부족한 필드는 기본값으로 채운다.
// spotByName: item.spotName → 실제 관광지 검색 결과. 로그 응답 자체엔 spotId가 없어서
// (스팟 이름만 내려옴) 넘어오면 실제 스팟 정보(주소/썸네일/카테고리/북마크 여부)로 채우고,
// 없으면(검색에서 못 찾은 극히 일부 경우만) 플레이스홀더로 대체한다. spotId가 있어야
// REST addItem으로 DB에 실제 저장도 되므로, 매칭 자체가 지속성에도 필요하다.
export function buildDaysFromTravelLogDetail(
  log: TravelLogDetailResponse,
  spotByName?: Map<string, SpotSearchResponse>,
): {
  days: BaseStop[][];
  dates: string[];
} {
  const sortedDays = [...(log.days ?? [])].sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));

  const days = sortedDays.map((day) => {
    const items = [...(day.items ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    // toStopId(다음 스팟 id)를 rebuildTransport()가 참조하려면 순서대로 미리 확정돼있어야
    // 해서, map 안에서 그때그때 nextTempStopId()를 부르는 대신 배열로 먼저 뽑아둔다.
    const ids = items.map(() => nextTempStopId());

    return items.map((item, idx): BaseStop => {
      const nextItem = items[idx + 1];
      const placeName = item.spotName ?? "장소 미정";
      const nextPlaceName = nextItem?.spotName ?? "";
      const transportType: TransportType = "버스";
      const representativePhoto =
        item.photos?.find((photo) => photo.representative)?.photoUrl ?? item.photos?.[0]?.photoUrl;
      const matchedSpot = spotByName?.get(placeName);
      const recommendedTransport = nextItem
        ? {
            from: placeName,
            to: nextPlaceName,
            durationMin: 30,
            baseDurationMin: 30,
            cost: 1500,
            legs: [
              {
                type: transportType,
                routeName: transportType,
                from: getTransportPointName(transportType, placeName),
                to: getTransportPointName(transportType, nextPlaceName),
              },
            ],
            toStopId: ids[idx + 1],
          }
        : undefined;

      return {
        id: ids[idx],
        spotId: matchedSpot?.spotId,
        time: normalizeTime(item.arrivalTime, "10:00"),
        placeName,
        imageUrl: matchedSpot?.thumbnailUrl || representativePhoto || FALLBACK_IMAGE,
        category: getCategoryFromKo(matchedSpot?.category ?? item.spotCategory ?? "", placeName),
        status: "verify",
        // description/운영시간/문의처는 TimelinePlaceDetailPopup이 spotId로 실제 데이터를
        // 조회해서 보여준다(useSpotDetail) — 여기서 가짜 문구로 채우지 않는다.
        address: matchedSpot?.address ?? "부산광역시",
        mapUrl: `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`,
        isBookmarked: matchedSpot?.collected,
        transport: recommendedTransport,
        recommendedTransport,
      };
    });
  });

  const dates = sortedDays.map((day) => {
    if (!day.date) return "";
    const [year, month, dayNum] = day.date.split("-");
    return `${year}.${month}.${dayNum}`;
  });

  return { days, dates };
}

// 백엔드가 "H:mm:ss" 같은 형태로 시간을 내려줄 때가 있어서, 화면에는 항상
// 초 없이 0으로 패딩된 "HH:mm" 형태로 통일해서 보여준다.
export function normalizeTime(raw: string | undefined, fallback = "00:00"): string {
  if (!raw) return fallback;
  const [hour, minute] = raw.split(":");
  const h = Number(hour);
  const m = Number(minute);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return fallback;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":");
  return (Number(hour) || 0) * 60 + (Number(minute) || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 교통수단을 바꿔서 자동으로 밀리는 시간은 10분 단위로 맞춘다 — 원래 있던 시간(예:
// 10:13)은 그대로 두고, 이번에 새로 계산되는 시간만 10분 단위로 반올림한다.
export function roundToNearest10(totalMinutes: number): number {
  return Math.round(totalMinutes / 10) * 10;
}

const API_TRAVEL_MODE_MAP: Record<string, TransportType> = {
  transit: "버스",
  bus: "버스",
  walk: "도보",
  taxi: "택시",
};

const TRANSPORT_TYPES: readonly TransportType[] = ["버스", "지하철", "도보", "택시"];

// 백엔드가 내려주는 routeType("버스"/"지하철"/"도보"/"택시")이 있으면 그대로 쓰고,
// 없으면(예전 데이터 등) travelMode 기반 매핑으로 대체한다. routeType이 travelMode보다
// 더 정확하다 — travelMode="transit"만으로는 버스/지하철을 구분 못 한다.
function resolveTransportType(
  routeType: string | undefined,
  travelMode: string | undefined,
): TransportType | undefined {
  if (routeType && (TRANSPORT_TYPES as readonly string[]).includes(routeType)) {
    return routeType as TransportType;
  }
  return travelMode ? API_TRAVEL_MODE_MAP[travelMode] : undefined;
}

interface TravelModeItemLike {
  travelMode?: string;
  travelTimeMin?: number;
  routeType?: string;
  routeNo?: string;
  startStationName?: string;
  endStationName?: string;
}

// PATCH .../travel-mode 응답(ItineraryItemResponse)을 화면이 쓰는 TransportInfo로 변환한다.
// buildTransportOptions()가 만드는 카드 미리보기와 달리 이건 백엔드가 ODsay로 실제
// 재계산한 값이라 역명/노선번호가 진짜다 — 사용자가 이동수단을 확정한 뒤에만 쓴다.
export function buildTransportFromItem(
  item: TravelModeItemLike,
  fromPlaceName: string,
  toPlaceName: string,
  toStopId: string,
  fallbackDurationMin: number,
  cost?: number,
): BaseStop["transport"] {
  const transportType = resolveTransportType(item.routeType, item.travelMode);
  if (!transportType) return undefined;

  const from = item.startStationName || getTransportPointName(transportType, fromPlaceName);
  const to = item.endStationName || getTransportPointName(transportType, toPlaceName);
  const durationMin = item.travelTimeMin ?? fallbackDurationMin;

  return {
    from,
    to,
    durationMin,
    baseDurationMin: durationMin,
    cost,
    legs: [
      {
        type: transportType,
        routeName: item.routeNo || transportType,
        from,
        to,
      },
    ],
    toStopId,
  };
}

interface TripTimeBoundsLike {
  startTime: string;
  endTime: string;
}

// 백엔드에서 아직 도착시간이 안 정해진(null) 항목에 아침/오후/저녁 순으로 대략적인
// 시간을 미리 배정한다. 첫날은 여행 시작 시간, 마지막날은 종료 시간을 벗어나지 않게 한다.
const DEFAULT_DAY_SLOTS = [
  { time: "10:00", hour: 10 },
  { time: "14:00", hour: 14 },
  { time: "18:00", hour: 18 },
];

function getDefaultItemTime(
  dayIdx: number,
  totalDays: number,
  itemIdx: number,
  itemCount: number,
  bounds?: TripTimeBoundsLike | null,
): string {
  let slots = DEFAULT_DAY_SLOTS;
  if (dayIdx === 0 && bounds?.startTime) {
    const startHour = Number(bounds.startTime.split(":")[0]);
    if (Number.isFinite(startHour)) {
      if (startHour >= 18) slots = slots.filter((s) => s.hour >= 18);
      else if (startHour >= 12) slots = slots.filter((s) => s.hour >= 12);
    }
  }
  if (dayIdx === totalDays - 1 && bounds?.endTime) {
    const endHour = Number(bounds.endTime.split(":")[0]);
    if (Number.isFinite(endHour)) {
      if (endHour < 12) slots = slots.filter((s) => s.hour < 12);
      else if (endHour < 18) slots = slots.filter((s) => s.hour < 18);
    }
  }
  if (slots.length === 0) slots = DEFAULT_DAY_SLOTS;
  const time = slots[itemIdx % slots.length]?.time ?? "10:00";

  // 위 버킷 필터는 대략적인 시간대만 걸러내서, 여행 전체의 첫/마지막 일정은 여전히
  // 정확한 시작/종료 시간보다 이르거나 늦게 배정될 수 있다 — 그 두 항목만 정확한
  // 경계값으로 강제 보정한다(validateStopTime과 동일하게 경계값 자체는 허용).
  if (dayIdx === 0 && itemIdx === 0 && bounds?.startTime && time < bounds.startTime) {
    return bounds.startTime;
  }
  if (
    dayIdx === totalDays - 1 &&
    itemIdx === itemCount - 1 &&
    bounds?.endTime &&
    time > bounds.endTime
  ) {
    return bounds.endTime;
  }
  return time;
}

// GET /api/itineraries/{id} 응답을 타임라인 UI가 쓰는 BaseStop[][] 구조로 변환한다.
// dayIds는 stopsPerDay와 같은 인덱스로 대응하는 실제 dayId — 일차별 쓰기 API(PATCH/DELETE)에 필요.
export function mapItineraryDetailToDays(
  detail: ItineraryDetailResponse,
  timeBounds?: TripTimeBoundsLike | null,
): {
  days: BaseStop[][];
  dates: string[];
  dayIds: string[];
} {
  const sortedDays = [...(detail.days ?? [])].sort(
    (a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0),
  );
  const totalDays = sortedDays.length;

  const days = sortedDays.map((day, dayIdx) => {
    const items = [...(day.items ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    return items.map((item, idx): BaseStop => {
      const nextItem = items[idx + 1];
      const placeName = item.spot?.name ?? "장소 미정";
      const nextPlaceName = nextItem?.spot?.name ?? "";
      const nextStopId = nextItem?.id ?? `${day.id}-${idx + 1}`;
      // travelMode/routeType은 최적화가 실행된 뒤에만 채워진다 — 값이 없으면(방금 추가한
      // 스팟 등) "버스"로 임의 확정하지 않고 transport 자체를 비워서 아직 계산 전임을
      // 그대로 반영한다.
      const transportType = resolveTransportType(nextItem?.routeType, nextItem?.travelMode);
      const recommendedTransport =
        nextItem && transportType
          ? {
              from: placeName,
              to: nextPlaceName,
              durationMin: nextItem.travelTimeMin ?? 30,
              baseDurationMin: nextItem.travelTimeMin ?? 30,
              legs: [
                {
                  type: transportType,
                  // routeNo(버스번호/지하철 노선명)가 있으면 실제 값을, 없으면(도보/택시 등)
                  // 타입 이름 그대로 표시한다.
                  routeName: nextItem.routeNo || transportType,
                  from:
                    nextItem.startStationName || getTransportPointName(transportType, placeName),
                  to:
                    nextItem.endStationName || getTransportPointName(transportType, nextPlaceName),
                },
              ],
              toStopId: nextStopId,
            }
          : undefined;

      return {
        id: item.id ?? `${day.id}-${idx}`,
        spotId: item.spot?.id,
        time: item.arrivalTime
          ? normalizeTime(item.arrivalTime)
          : getDefaultItemTime(dayIdx, totalDays, idx, items.length, timeBounds),
        placeName,
        imageUrl: item.spot?.thumbnailUrl || FALLBACK_IMAGE,
        category: getCategoryFromKo(item.spot?.category ?? "", placeName),
        status: "verify",
        // 여행 메모(실데이터)만 우선 보여준다 — 없으면 TimelinePlaceDetailPopup이
        // spotId로 실제 관광지 소개글을 조회해서 보여준다(useSpotDetail).
        description: item.memo,
        address: item.spot?.address,
        mapUrl: item.spot
          ? `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${item.spot.lat},${item.spot.lng}`
          : `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`,
        isBookmarked: item.spot?.collected,
        transport: recommendedTransport,
        recommendedTransport,
      };
    });
  });

  const dates = sortedDays.map((day) => {
    if (!day.date) return "";
    const [year, month, dayNum] = day.date.split("-");
    return `${year}.${month}.${dayNum}`;
  });

  const dayIds = sortedDays.map((day) => day.id ?? "");

  return { days, dates, dayIds };
}

export function rebuildTransport(stops: BaseStop[]): BaseStop[] {
  return stops.map((stop, idx) => {
    const nextStop = stops[idx + 1];
    if (!nextStop) return { ...stop, transport: undefined };

    const existing = stop.transport;
    const type = existing?.legs[0]?.type;
    // 기존에 계산된 이동수단이 없으면(아직 최적화 전) "버스"로 지어내지 않고 그대로 비워둔다.
    if (!type) return { ...stop, transport: undefined };

    // 이웃(다음 스팟)이 바뀌지 않았으면 백엔드/추천 경로가 이미 준 실제 값(정류장명·역명
    // 등)이 여전히 유효하므로 그대로 둔다. placeName 기준으로 다시 만들면 실제 역명이
    // "OO역"처럼 지어낸 이름으로 덮어써진다(예: UN조각공원 → 실제로는 대연역인데
    // "UN조각공원역"이라는 존재하지 않는 역이 표시되던 버그).
    if (existing.toStopId && existing.toStopId === nextStop.id) {
      return stop;
    }

    // 이웃이 바뀐 경우엔 이 정보가 더 이상 이 구간의 것이 아니므로, 가짜 이름으로
    // 다시 만들어내지 않고 비워서 재계산 전임을 그대로 반영한다(다음 최적화/이동수단
    // 변경 시 실제 값으로 채워짐).
    return { ...stop, transport: undefined };
  });
}

export function buildTransportOptions(activeStop: BaseStop | undefined): RouteOption[] {
  // 옵션1(추천)은 사용자가 그동안 뭘 선택했는지와 무관하게 항상 최초 계산된 추천
  // 경로(recommendedTransport)를 보여준다 — transport는 선택할 때마다 덮어써지므로
  // 여기서 쓰면 "버스 선택 후 다시 열었더니 추천도 버스로 바뀌어 보임" 문제가 생긴다.
  const recommended = activeStop?.recommendedTransport;
  const base = recommended?.baseDurationMin ?? activeStop?.transport?.baseDurationMin ?? 30;
  const f = recommended?.from ?? activeStop?.transport?.from ?? "";
  const t = recommended?.to ?? activeStop?.transport?.to ?? "";
  const transitLegs = (recommended?.legs ?? []).filter(
    (leg) => leg.type === "버스" || leg.type === "지하철",
  );

  return [
    {
      id: "transit",
      isRecommended: true,
      durationMin: base,
      cost: 1500,
      legs:
        transitLegs.length > 0
          ? transitLegs
          : [{ type: "버스" as const, routeName: "버스", from: f, to: t }],
    },
    {
      id: "subway",
      durationMin: Math.round(base * 0.85),
      cost: 1600,
      legs: [
        {
          type: "지하철" as const,
          routeName: "지하철",
          from: getTransportPointName("지하철", f),
          to: getTransportPointName("지하철", t),
        },
      ],
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
}

// buildTransportOptions()가 만드는 4개 옵션(transit/subway/taxi/walk) 중 이 스팟이
// 지금 실제로 어떤 걸 쓰고 있는지 id로 알려준다. 이걸 별도 state로 들고 있으면(예전 방식)
// 스팟마다 다른 값인데 전역 state 하나를 공유하게 돼서, 다른 스팟을 지하철로 바꾼 뒤
// 버스인 스팟을 열어도 지하철이 선택된 것처럼 보이는 문제가 있었다 — 그래서 매번
// activeStop에서 직접 계산한다.
export function getActiveTransportOptionId(stop: BaseStop | undefined): string {
  switch (stop?.transport?.legs[0]?.type) {
    case "지하철":
      return "subway";
    case "택시":
      return "taxi";
    case "도보":
      return "walk";
    default:
      return "transit";
  }
}
