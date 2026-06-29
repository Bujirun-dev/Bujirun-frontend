"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageCard, BackButton } from "@/components";
import { SAMPLE_LOGS } from "@/features/collection/data/sampleLogs";
import { PLACES } from "@/features/collection/data/places";

// TODO: API 연결 시 useQuery로 교체 — GET /tour-spots/:spotId/logs
// 해당 관광지를 방문한 로그 목록을 반환하는 API
function getRelatedLogs(placeName: string) {
  return SAMPLE_LOGS.filter((log) =>
    log.days.some((day) => day.stops.some((stop) => stop.place === placeName)),
  );
}

export default function RelatedLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // TODO: API 연결 시 id로 관광지명 fetch
  const placeInfo = PLACES.find((p) => p.id === Number(id));
  const placeName = placeInfo?.name ?? "";
  const relatedLogs = getRelatedLogs(placeName);

  return (
    <PageCard className="px-0 pt-0">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관련 로그</h1>
      </div>

      {/* 관광지명 */}
      {placeName && (
        <div className="px-6 pb-3 shrink-0">
          <span className="text-xs text-sub-gray">
            <span className="font-semibold text-sub-deepblue">{placeName}</span>을(를) 방문한 로그
          </span>
        </div>
      )}

      {/* 로그 목록 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {relatedLogs.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center h-full gap-2 pt-20">
            <span className="text-2xl">📭</span>
            <p className="text-sm text-sub-gray font-medium">아직 관련 로그가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {relatedLogs.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => router.push(`/collection/records/log/${log.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm active:opacity-70 text-left"
              >
                {/* 썸네일 */}
                <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden shrink-0">
                  <Image src={log.imageUrl} alt={log.title} fill className="object-cover" />
                </div>

                {/* 텍스트 정보 */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="font-ssurround font-bold text-md text-text-heading truncate">
                    {log.title}
                  </span>
                  <span className="text-xs text-sub-gray truncate">
                    📍 {log.placeName}
                    {log.extraCount > 0 && ` 외 ${log.extraCount}곳`}
                  </span>
                  <span className="text-xs text-sub-gray">{log.date}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-2xs text-sub-deepblue font-medium bg-system-selected px-1.5 py-0.5 rounded-md">
                      {log.duration}
                    </span>
                    <span className="text-2xs text-sub-gray">↓ {log.downloadCount}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageCard>
  );
}
