import type { ItineraryStop, RouteOption } from "../components";
import { getScheduleById, getPlaceById } from "@/mocks";
import type { TravelMode } from "@/shared/types";
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

const TRAVEL_MODE_MAP: Record<TravelMode, "버스" | "지하철" | "도보" | "택시"> = {
  transit: "버스",
  bus: "버스",
  walk: "도보",
  taxi: "택시",
};

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

function getPlaceDescription(placeName: string): string {
  return `${placeName}은(는) 부산 여행 일정에서 방문하기 좋은 관광지입니다. 주변 관광지와 함께 둘러보기 좋고, 일정 중 잠시 머물며 분위기를 느끼기 좋은 장소예요.`;
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

  const days = sortedDays.map((day, dayIdx) => {
    const items = [...(day.items ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    return items.map((item, idx): BaseStop => {
      const nextItem = items[idx + 1];
      const placeName = item.spotName ?? "장소 미정";
      const nextPlaceName = nextItem?.spotName ?? "";
      const transportType: TransportType = "버스";
      const representativePhoto =
        item.photos?.find((photo) => photo.representative)?.photoUrl ?? item.photos?.[0]?.photoUrl;
      const matchedSpot = spotByName?.get(placeName);

      return {
        id: `imported-${log.id}-d${dayIdx}-${idx}`,
        spotId: matchedSpot?.spotId,
        time: normalizeTime(item.arrivalTime, "10:00"),
        placeName,
        imageUrl: matchedSpot?.thumbnailUrl || representativePhoto || FALLBACK_IMAGE,
        category: getCategoryFromKo(matchedSpot?.category ?? item.spotCategory ?? ""),
        status: "verify",
        // description/운영시간/문의처는 TimelinePlaceDetailPopup이 spotId로 실제 데이터를
        // 조회해서 보여준다(useSpotDetail) — 여기서 가짜 문구로 채우지 않는다.
        address: matchedSpot?.address ?? "부산광역시",
        mapUrl: `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`,
        isBookmarked: matchedSpot?.collected,
        transport: nextItem
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
            }
          : undefined,
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

export function buildDays(scheduleId: string): { days: BaseStop[][]; dates: string[] } {
  const schedule = getScheduleById(scheduleId);
  if (!schedule) return { days: [], dates: [] };

  const days = schedule.days.map((day) =>
    day.items.map((item, idx): BaseStop => {
      const place = getPlaceById(item.spotId);
      const nextItem = day.items[idx + 1];
      const transport = (() => {
        if (!nextItem) return undefined;
        const transportType = TRAVEL_MODE_MAP[nextItem.travelMode] ?? "버스";
        return {
          from: item.spotName,
          to: nextItem.spotName,
          durationMin: nextItem.travelTimeMin,
          baseDurationMin: nextItem.travelTimeMin,
          legs: [
            {
              type: transportType,
              routeName: nextItem.routeName ?? transportType,
              from: getTransportPointName(transportType, item.spotName),
              to: getTransportPointName(transportType, nextItem.spotName),
            },
          ],
        };
      })();

      return {
        id: item.id,
        time: item.arrivalTime,
        placeName: item.spotName,
        imageUrl: place?.thumbnailUrl || FALLBACK_IMAGE,
        category: getCategoryFromKo(place?.category ?? ""),
        status: "verify",
        description: getPlaceDescription(item.spotName),
        address: place?.address,
        mapUrl: place
          ? `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
          : `https://map.kakao.com/link/search/${encodeURIComponent(item.spotName)}`,
        isBookmarked: place?.isCollected,
        transport,
      };
    }),
  );

  const dates = schedule.days.map((d) => {
    const [, month, day] = d.date.split("-");
    return `2026.${month}.${day}`;
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

const API_TRAVEL_MODE_MAP: Record<string, TransportType> = {
  transit: "버스",
  bus: "버스",
  walk: "도보",
  taxi: "택시",
};

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
      const transportType = API_TRAVEL_MODE_MAP[nextItem?.travelMode ?? ""] ?? "버스";

      return {
        id: item.id ?? `${day.id}-${idx}`,
        spotId: item.spot?.id,
        time: item.arrivalTime
          ? normalizeTime(item.arrivalTime)
          : getDefaultItemTime(dayIdx, totalDays, idx, items.length, timeBounds),
        placeName,
        imageUrl: item.spot?.thumbnailUrl || FALLBACK_IMAGE,
        category: getCategoryFromKo(item.spot?.category ?? ""),
        status: "verify",
        // 여행 메모(실데이터)만 우선 보여준다 — 없으면 TimelinePlaceDetailPopup이
        // spotId로 실제 관광지 소개글을 조회해서 보여준다(useSpotDetail).
        description: item.memo,
        address: item.spot?.address,
        mapUrl: item.spot
          ? `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${item.spot.lat},${item.spot.lng}`
          : `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`,
        isBookmarked: item.spot?.collected,
        transport: nextItem
          ? {
              from: placeName,
              to: nextPlaceName,
              durationMin: nextItem.travelTimeMin ?? 30,
              baseDurationMin: nextItem.travelTimeMin ?? 30,
              legs: [
                {
                  type: transportType,
                  routeName: transportType,
                  from: getTransportPointName(transportType, placeName),
                  to: getTransportPointName(transportType, nextPlaceName),
                },
              ],
            }
          : undefined,
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
    const type = existing?.legs[0]?.type ?? "버스";
    const durationMin = existing?.durationMin ?? 30;
    const baseDurationMin = existing?.baseDurationMin ?? 30;
    const cost = existing?.cost ?? 1500;

    return {
      ...stop,
      transport: {
        from: stop.placeName,
        to: nextStop.placeName,
        durationMin,
        baseDurationMin,
        cost,
        legs: [
          {
            type,
            routeName: existing?.legs[0]?.routeName ?? type,
            from: getTransportPointName(type, stop.placeName),
            to: getTransportPointName(type, nextStop.placeName),
          },
        ],
      },
    };
  });
}

export function buildTransportOptions(activeStop: BaseStop | undefined): RouteOption[] {
  const base = activeStop?.transport?.baseDurationMin ?? 30;
  const f = activeStop?.transport?.from ?? "";
  const t = activeStop?.transport?.to ?? "";
  const transitLegs = (activeStop?.transport?.legs ?? []).filter(
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
