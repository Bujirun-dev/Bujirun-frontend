"use client";

import { use } from "react";
import { RelatedLogsContent } from "@/components";
import { getRelatedLogs } from "@/features/mypage/data/relatedLogs";
import { PLACES } from "@/features/collection/data/places";
import type { Category } from "@/components";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs

export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const placeId = Number(id);
  const placeInfo = PLACES.find((p) => p.id === placeId);
  const placeName = placeInfo?.name ?? "";
  const relatedLogs = getRelatedLogs(placeId);

  return (
    <RelatedLogsContent
      placeName={placeName}
      category={placeInfo?.category as Category | undefined}
      relatedLogs={relatedLogs}
    />
  );
}
