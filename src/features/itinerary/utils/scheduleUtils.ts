import type { Category } from "@/components";
import type { ItineraryStop, RouteOption } from "../components";
import { SAMPLE_LOGS } from "../data/sampleLogs";
import { getScheduleById, getPlaceById } from "@/mocks";
import type { TravelMode } from "@/shared/types";
import { getCategoryFromKo } from "@/shared/constants/category";

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
  "onDelete" | "onClick" | "onTimeClick" | "onTransportClick" | "onVerify"
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
