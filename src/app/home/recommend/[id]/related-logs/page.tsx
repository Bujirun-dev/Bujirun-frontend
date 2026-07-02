"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { BackButton, PageCard } from "@/components";
import { LogCard } from "@/features/home/components/LogCard";
import { RECOMMENDED_PLACE } from "@/features/home/data/recommendedPlace";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs
export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // TODO: API 연결 시 id로 관광지 상세 조회 후 placeName 사용
  const placeName = RECOMMENDED_PLACE.name;
  const relatedLogs = SAMPLE_LOGS.filter(
    (log) =>
      log.id === id ||
      log.placeName === placeName ||
      log.days.some((day) => day.stops.some((stop) => stop.place === placeName)),
  );

  return (
    <PageCard className="flex h-full flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center gap-3 pb-4">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround text-xl text-text-heading leading-none">관련 로그</h1>
      </div>

      {/* 관광지명 */}
      {placeName && (
        <div className="shrink-0 pb-4">
          <span className="text-sm text-sub-gray">
            <span className="font-semibold text-sub-deepblue">{placeName}</span>을(를) 방문한 로그
          </span>
        </div>
      )}

      {/* 로그 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {relatedLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 pt-20">
            <span className="text-2xl">📭</span>
            <p className="text-sm font-medium text-sub-gray">아직 관련 로그가 없어요</p>
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
                onClick={() => router.push(`/home/logs/${log.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageCard>
  );
}
