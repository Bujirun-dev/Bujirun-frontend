"use client";

import { usePlaceDetailQueries } from "@/shared/hooks/usePlaceDetailQueries";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton, PageCard } from "@/components";
import { getKakaoMapUrl } from "@/shared/utils";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getBookmarkCategory } from "@/features/mypage/utils/bookmarkCategory";

export default function BookmarkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ thumbnail?: string }>;
}) {
  const { id } = use(params);
  // 북마크 목록에서 넘겨준 썸네일 — spot API 응답 전 플레이스홀더 대신 사용
  const { thumbnail } = use(searchParams);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { detailQuery, relatedLogs } = usePlaceDetailQueries(id, {
    detail: Boolean(accessToken && id),
    logs: Boolean(accessToken && id),
  });
  const { data: spot } = detailQuery;

  const [isBookmarked, setIsBookmarked] = useState(true);

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkApi.removeBookmark(id) : bookmarkApi.addBookmark(id)),
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
    },
  });

  return (
    <PageCard>
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관광지 상세보기</h1>
      </div>

      <PlaceDetailContent
        place={{
          // spot API 응답 전엔 목록에서 받은 thumbnail 사용, 그것도 없으면 플레이스홀더
          imageUrl: spot?.thumbnailUrl ?? thumbnail ?? `https://picsum.photos/seed/${id}/400/300`,
          name: spot?.name ?? "",
          category: getBookmarkCategory(spot?.collectionCategory, spot?.name) ?? "nature",
          description: spot?.overview ?? "",
          address: spot?.address ?? "",
          mapUrl: getKakaoMapUrl(spot?.name, spot?.lat, spot?.lng),
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
