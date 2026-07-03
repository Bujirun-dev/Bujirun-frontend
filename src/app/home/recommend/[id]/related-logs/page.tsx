"use client";

import { use } from "react";
import { RelatedLogsContent } from "@/components";
import { PLACES } from "@/features/home/data/places";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs
export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const place = PLACES.find((p) => String(p.id) === id);
  const placeName = place?.name ?? "";
  const relatedLogs = SAMPLE_LOGS.filter(
    (log) =>
      log.placeName === placeName ||
      log.days.some((day) => day.stops.some((stop) => stop.place === placeName)),
  );

  return (
    <RelatedLogsContent
      placeName={placeName}
      category={place?.category}
      relatedLogs={relatedLogs}
      logHrefBase="/home/logs"
    />
  );
}
