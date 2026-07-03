"use client";

import { RelatedLogsContent } from "@/components";
import { RECOMMENDED_PLACE } from "@/features/home/data/recommendedPlace";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs
export default function RelatedLogsPage() {
  const placeName = RECOMMENDED_PLACE.name;
  const relatedLogs = SAMPLE_LOGS.filter(
    (log) =>
      log.id === RECOMMENDED_PLACE.id ||
      log.placeName === placeName ||
      log.days.some((day) => day.stops.some((stop) => stop.place === placeName)),
  );

  return (
    <RelatedLogsContent
      placeName={placeName}
      category={RECOMMENDED_PLACE.category}
      relatedLogs={relatedLogs}
      logHrefBase="/home/logs"
    />
  );
}
