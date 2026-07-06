import type { Category } from "@/components";
import type { ItineraryStop, RouteOption } from "../components";
import { SAMPLE_LOGS } from "../data/sampleLogs";
import { getScheduleById, getPlaceById } from "@/mocks";
import type { TravelMode } from "@/shared/types";
import { getCategoryFromKo } from "@/shared/constants/category";
import type { components } from "@/shared/api/schema";

type ItineraryDetailResponse = components["schemas"]["ItineraryDetailResponse"];

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

export function categoryFromTags(tags: string[]): Category {
  const joined = tags.join("");
  if (joined.includes("#바다")) return "sea";
  if (joined.includes("#자연") || joined.includes("#등산") || joined.includes("#산"))
    return "nature";
  if (joined.includes("#문화") || joined.includes("#골목") || joined.includes("#역사"))
    return "culture";
  if (joined.includes("#체험") || joined.includes("#케이블") || joined.includes("#레저"))
    return "experience";
  return "sea";
}

function parseTimeToMinutes(time: string): number | null {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function getImportedTravelDuration(fromTime: string, toTime: string): number {
  const fromMinutes = parseTimeToMinutes(fromTime);
  const toMinutes = parseTimeToMinutes(toTime);
  if (fromMinutes === null || toMinutes === null || toMinutes <= fromMinutes) return 30;
  return Math.min(Math.max(Math.round((toMinutes - fromMinutes) / 4), 15), 60);
}

export function getTransportPointName(type: TransportType, placeName: string): string {
  if (type === "버스") return `${placeName} 인근 정류장`;
  if (type === "지하철") return `${placeName}역`;
  return placeName;
}

function getPlaceDescription(placeName: string): string {
  return `${placeName}은(는) 부산 여행 일정에서 방문하기 좋은 관광지입니다. 주변 관광지와 함께 둘러보기 좋고, 일정 중 잠시 머물며 분위기를 느끼기 좋은 장소예요.`;
}

export function buildDaysFromLog(log: (typeof SAMPLE_LOGS)[0]): {
  days: BaseStop[][];
  dates: string[];
} {
  const days = log.days.map((daySchedule) =>
    daySchedule.stops.map((stop, idx): BaseStop => {
      const nextStop = daySchedule.stops[idx + 1];
      const durationMin = nextStop ? getImportedTravelDuration(stop.time, nextStop.time) : 0;
      const transportType: TransportType = "버스";

      return {
        id: `imported-${log.id}-d${daySchedule.day}-${idx}`,
        time: stop.time,
        placeName: stop.place,
        imageUrl: stop.imageUrl || FALLBACK_IMAGE,
        category: categoryFromTags(stop.tags),
        status: "verify" as const,
        description: getPlaceDescription(stop.place),
        address: "부산광역시",
        operatingHours: "운영 정보 확인 필요",
        fee: "무료",
        parking: "주차 정보 확인 필요",
        mapUrl: `https://map.kakao.com/link/search/${encodeURIComponent(stop.place)}`,
        transport: nextStop
          ? {
              from: stop.place,
              to: nextStop.place,
              durationMin,
              baseDurationMin: durationMin,
              cost: 1500,
              legs: [
                {
                  type: transportType,
                  routeName: "버스",
                  from: getTransportPointName(transportType, stop.place),
                  to: getTransportPointName(transportType, nextStop.place),
                },
              ],
            }
          : undefined,
      };
    }),
  );
  const dates = log.days.map((d) => d.date.replace(/-/g, "."));
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
        operatingHours: place?.operatingHours,
        fee: "무료",
        parking: "공영 주차장",
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

const API_TRAVEL_MODE_MAP: Record<string, TransportType> = {
  transit: "버스",
  bus: "버스",
  walk: "도보",
  taxi: "택시",
};

// GET /api/itineraries/{id} 응답을 타임라인 UI가 쓰는 BaseStop[][] 구조로 변환한다.
// dayIds는 stopsPerDay와 같은 인덱스로 대응하는 실제 dayId — 일차별 쓰기 API(PATCH/DELETE)에 필요.
export function mapItineraryDetailToDays(detail: ItineraryDetailResponse): {
  days: BaseStop[][];
  dates: string[];
  dayIds: string[];
} {
  const sortedDays = [...(detail.days ?? [])].sort(
    (a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0),
  );

  const days = sortedDays.map((day) => {
    const items = [...(day.items ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    return items.map((item, idx): BaseStop => {
      const nextItem = items[idx + 1];
      const placeName = item.spot?.name ?? "장소 미정";
      const nextPlaceName = nextItem?.spot?.name ?? "";
      const transportType = API_TRAVEL_MODE_MAP[nextItem?.travelMode ?? ""] ?? "버스";

      return {
        id: item.id ?? `${day.id}-${idx}`,
        time: item.arrivalTime ?? "00:00",
        placeName,
        imageUrl: item.spot?.thumbnailUrl || FALLBACK_IMAGE,
        category: getCategoryFromKo(item.spot?.category ?? ""),
        status: "verify",
        description: item.memo || getPlaceDescription(placeName),
        address: item.spot?.address,
        fee: "무료",
        parking: "공영 주차장",
        mapUrl: item.spot
          ? `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${item.spot.lat},${item.spot.lng}`
          : `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`,
        isBookmarked: item.spot?.isCollected,
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
