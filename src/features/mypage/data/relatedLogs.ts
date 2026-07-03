// TODO: API 연결 시 GET /tour-spots/:spotId/logs 로 교체

import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import type { LogDetail } from "@/features/itinerary/data/sampleLogs";
import { PLACES } from "@/features/collection/data/places";

export type RelatedLog = LogDetail;

function normalizePlaceName(name: string) {
  return name.replace(/\s/g, "");
}

export function getRelatedLogsByPlaceName(placeName: string): RelatedLog[] {
  const normalized = normalizePlaceName(placeName);

  return SAMPLE_LOGS.filter((log) => {
    if (
      normalizePlaceName(log.placeName).includes(normalized) ||
      normalized.includes(normalizePlaceName(log.placeName))
    ) {
      return true;
    }
    return log.days.some((day) =>
      day.stops.some((stop) => {
        const stopNorm = normalizePlaceName(stop.place);
        return (
          stopNorm === normalized || stopNorm.includes(normalized) || normalized.includes(stopNorm)
        );
      }),
    );
  });
}

export function getRelatedLogs(placeId: number): RelatedLog[] {
  const place = PLACES.find((p) => p.id === placeId);
  if (!place) return [];
  return getRelatedLogsByPlaceName(place.name);
}
