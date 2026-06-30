"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageCard, BackButton } from "@/components";
import { LogCard } from "@/features/itinerary";
import { getRelatedLogs } from "@/features/mypage/data/relatedLogs";
import { PLACES } from "@/features/collection/data/places";
import { CategoryChip } from "@/components";
import type { Category } from "@/components";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs

export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const placeId = Number(id);
  const placeInfo = PLACES.find((p) => p.id === placeId);
  const placeName = placeInfo?.name ?? "";
  const relatedLogs = getRelatedLogs(placeId);

  return (
    <PageCard>
      {/* 헤더 */}
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관련 로그 둘러보기</h1>
      </div>

      {/* 관광지명 칩 */}
      {placeName && (
        <div className="flex items-center gap-2 pb-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-system-selected border border-main-blue/30 rounded-full px-3 py-1.5">
            <span className="text-sm">📍</span>
            <span className="text-md font-semibold text-sub-deepblue">{placeName}</span>
          </div>
          {placeInfo?.category && (
            <CategoryChip category={placeInfo.category as Category} size="lg" />
          )}
        </div>
      )}
      {/* 로그 목록 */}
      <div className="flex-1 overflow-y-auto pb-6">
        {relatedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pt-20">
            <span className="text-4xl">📭</span>
            <p className="text-sm text-sub-gray font-medium">아직 관련 로그가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {relatedLogs.map((log) => (
              <LogCard
                key={log.id}
                imageUrl={log.imageUrl}
                placeName={log.placeName}
                extraCount={log.extraCount}
                author={log.author}
                duration={log.duration}
                date={log.date}
                downloadCount={log.downloadCount}
                onClick={() => router.push(`/itinerary/logs/${log.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageCard>
  );
}
