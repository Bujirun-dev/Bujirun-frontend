"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BackButton, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export default function BookmarkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isBookmarked, setIsBookmarked] = useState(true);

  // GET /api/logs/spot/{spotId}
  const { data: logs = [] } = useQuery({
    queryKey: travelLogApi.keys.bySpot(id),
    queryFn: () => travelLogApi.getLogsBySpot(id),
    enabled: !!accessToken && !!id,
  });

  // TravelLogSummaryResponse → PlaceDetailRelatedLog (미리보기용 2개)
  const relatedLogs = logs.slice(0, 2).map((log) => ({
    id: log.id ?? "",
    imageUrl: log.thumbnailPhotoUrl ?? "",
    author: log.authorNickname ?? "",
  }));

  return (
    <PageCard>
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관광지 상세보기</h1>
      </div>

      {/* TODO: 관광지 상세 API(GET /api/spots/{spotId}) 추가되면 아래 mock 데이터 교체 */}
      <PlaceDetailContent
        place={{
          imageUrl: `https://picsum.photos/seed/${id}/400/300`,
          name: "관광지",
          category: "sea",
          description: "",
          address: "",
          isBookmarked,
          infoItems: [],
        }}
        onBookmark={() => {
          setIsBookmarked((prev) => !prev);
          // TODO: 북마크 API 연결
        }}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/mypage/bookmarks/${id}/related-logs`)}
        getRelatedLogHref={(logId) => `/mypage/logs/${logId}`}
        onLogClick={(logId) => router.push(`/mypage/logs/${logId}`)}
      />
    </PageCard>
  );
}
