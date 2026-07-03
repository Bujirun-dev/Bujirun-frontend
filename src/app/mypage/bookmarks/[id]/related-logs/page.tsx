"use client";

import { use } from "react";
import { RelatedLogsContent } from "@/components";
import { getRelatedLogs } from "@/features/mypage/data/relatedLogs";
import { PLACES } from "@/features/collection/data/places";
import type { Category } from "@/components";

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
      // 마이페이지 전용 로그 상세 경로 prefix 주입 (RelatedLogsContent 내부에서 router.push 처리)
      logHrefBase="/mypage/logs"
    />
  );
}
