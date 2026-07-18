"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BackButton, PageCard } from "@/components";
import type { Category } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { bookmarkApi, spotApi, travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

function toCategory(value?: string, name?: string): Category {
  // TODO: 백엔드 category 응답이
  // "바다" | "자연" | "문화" | "체험"으로 통일되면
  // 아래 임시 문자열 판별 로직을 단순화
  if (name?.includes("해수욕장") || name?.includes("해변")) {
    return "sea";
  }

  if (!value) return "nature";
  if (value.includes("바다") || value.includes("해수욕")) {
    return "sea";
  }

  if (value.includes("자연")) {
    return "nature";
  }

  if (value.includes("문화") || value.includes("역사")) {
    return "culture";
  }

  if (value.includes("체험") || value.includes("놀이")) {
    return "experience";
  }

  return "nature";
}

export default function RecommendedPlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 관광지 상세 조회
  const {
    data: spot,
    isLoading,
    isError,
  } = useQuery({
    queryKey: spotApi.keys.detail(id),
    queryFn: () => spotApi.getSpot(id),
    enabled: Boolean(accessToken && id),
  });

  // 북마크 목록 조회
  const { data: bookmarks = [] } = useQuery({
    queryKey: bookmarkApi.keys.list(),
    queryFn: bookmarkApi.getBookmarks,
    enabled: Boolean(accessToken),
  });

  // 관광지 관련 로그 조회
  const { data: logs = [] } = useQuery({
    queryKey: travelLogApi.keys.bySpot(id),
    queryFn: () => travelLogApi.getLogsBySpot(id),
    enabled: Boolean(accessToken && id),
  });

  // collected가 아니라 북마크 목록에 현재 spotId가 있는지로 판단
  const isBookmarked = bookmarks.some((bookmark) => bookmark.spotId === id);

  // 북마크 추가/삭제
  const { mutate: toggleBookmark, isPending: isBookmarkPending } = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkApi.removeBookmark(id) : bookmarkApi.addBookmark(id)),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookmarkApi.keys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: spotApi.keys.detail(id),
        }),
        queryClient.invalidateQueries({
          queryKey: spotApi.keys.search(),
        }),
      ]);
    },
  });

  if (isLoading) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sm text-sub-gray">
          관광지 정보를 불러오는 중입니다.
        </div>
      </PageCard>
    );
  }

  if (isError || !spot || !spot.name) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sm text-sub-gray">
          관광지를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  const relatedLogs = logs.slice(0, 2).map((log) => ({
    id: log.id ?? "",
    imageUrl: log.thumbnailPhotoUrl ?? "",
    author: log.authorNickname ?? "",
  }));

  return (
    <PageCard>
      <div className="flex shrink-0 items-center gap-3 pb-4">
        <BackButton className="bg-transparent" onClick={() => router.back()} />

        <h1 className="font-ssurround text-lg font-bold text-text-heading">여기는 어때요?</h1>
      </div>

      <PlaceDetailContent
        place={{
          imageUrl: spot.thumbnailUrl ?? `https://picsum.photos/seed/${id}/400/300`,
          name: spot.name,
          category: toCategory(spot.category, spot.name),
          description: spot.overview ?? "",
          address: spot.address ?? "",
          isBookmarked,
          infoItems: [
            ...(spot.operatingHours
              ? [
                  {
                    type: "clock" as const,
                    label: "운영시간",
                    value: spot.operatingHours,
                  },
                ]
              : []),

            ...(spot.tel
              ? [
                  {
                    type: "call" as const,
                    label: "문의",
                    value: spot.tel,
                  },
                ]
              : []),
          ],
        }}
        onBookmark={() => {
          if (!isBookmarkPending) {
            toggleBookmark();
          }
        }}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/home/recommend/${id}/related-logs`)}
        getRelatedLogHref={(logId) => `/home/logs/${logId}`}
        onLogClick={(logId) => router.push(`/home/logs/${logId}`)}
      />
    </PageCard>
  );
}
