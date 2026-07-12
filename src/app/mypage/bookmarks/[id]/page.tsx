"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { travelLogApi, spotApi, bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Category } from "@/components";

//카테고리
function toCategory(value?: string, name?: string): Category {
  if (name?.includes("해수욕장") || name?.includes("해변")) return "sea";
  if (!value) return "nature";
  if (value.includes("자연")) return "nature";
  if (value.includes("문화") || value.includes("역사")) return "culture";
  if (value.includes("체험") || value.includes("놀이")) return "experience";
  if (value.includes("바다") || value.includes("해수욕")) return "sea";
  return "nature";
}

export default function BookmarkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  // 관광지 상세 조회
  const { data: spot } = useQuery({
    queryKey: spotApi.keys.detail(id),
    queryFn: () => spotApi.getSpot(id),
    enabled: !!accessToken && !!id,
  });

  // 관련 로그 조회
  const { data: logs = [] } = useQuery({
    queryKey: travelLogApi.keys.bySpot(id),
    queryFn: () => travelLogApi.getLogsBySpot(id),
    enabled: !!accessToken && !!id,
  });

  // 북마크 상태 (spot.collected 기준)
  const [isBookmarked, setIsBookmarked] = useState(true);

  // 북마크 토글
  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkApi.removeBookmark(id) : bookmarkApi.addBookmark(id)),
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
    },
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

      <PlaceDetailContent
        place={{
          imageUrl: spot?.thumbnailUrl ?? `https://picsum.photos/seed/${id}/400/300`,
          name: spot?.name ?? "",
          category: toCategory(spot?.category, spot?.name),
          description: spot?.overview ?? "",
          address: spot?.address ?? "",
          isBookmarked,
          infoItems: [
            ...(spot?.operatingHours
              ? [{ type: "clock" as const, label: "운영시간", value: spot.operatingHours }]
              : []),
            ...(spot?.tel ? [{ type: "call" as const, label: "문의", value: spot.tel }] : []),
          ],
        }}
        onBookmark={() => toggleBookmark()}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/mypage/bookmarks/${id}/related-logs`)}
        getRelatedLogHref={(logId) => `/mypage/logs/${logId}`}
        onLogClick={(logId) => router.push(`/mypage/logs/${logId}`)}
      />
    </PageCard>
  );
}
