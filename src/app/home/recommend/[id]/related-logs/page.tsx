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

  // TravelLogSummaryResponse 타입에 맞게 변환
  const relatedLogs = SAMPLE_LOGS.filter(
    (log) =>
      log.placeName === placeName ||
      log.days.some((day) => day.stops.some((stop) => stop.place === placeName)),
  ).map((log) => ({
    id: log.id,
    title: log.title,
    thumbnailPhotoUrl: log.imageUrl,
    isPublic: log.isVisible,
    startDate: log.createdAt,
    totalSpots: log.days.reduce((acc, day) => acc + day.stops.length, 0),
    authorNickname: log.author,
    addedCount: log.downloadCount,
    mood: 0, // mock 데이터라 임시값 (API 연동 시 실제 값으로 교체)
    theme: log.theme,
    createdAt: log.createdAt,
  }));

  return (
    <RelatedLogsContent
      placeName={placeName}
      category={place?.category}
      relatedLogs={relatedLogs}
      logHrefBase="/home/logs"
    />
  );
}
