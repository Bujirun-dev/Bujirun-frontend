"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageCard, Toast, LoadingBoundary } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { travelLogApi, spotApi, bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Category } from "@/components";
import { BOOKMARK_TOAST_MESSAGE } from "@/shared/constants/bookmark";

function toCategory(value?: string, name?: string): Category {
  if (name?.includes("해수욕장") || name?.includes("해변")) return "sea";
  if (!value) return "nature";
  if (value.includes("자연")) return "nature";
  if (value.includes("문화") || value.includes("역사")) return "culture";
  if (value.includes("체험") || value.includes("놀이")) return "experience";
  if (value.includes("바다") || value.includes("해수욕")) return "sea";
  return "nature";
}

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

  // 토스트 상태
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { data: spot, isLoading } = useQuery({
    // isLoading 추가
    queryKey: spotApi.keys.detail(id),
    queryFn: () => spotApi.getSpot(id),
    enabled: !!accessToken && !!id,
  });

  const { data: logs = [] } = useQuery({
    queryKey: travelLogApi.keys.bySpot(id),
    queryFn: () => travelLogApi.getLogsBySpot(id),
    enabled: !!accessToken && !!id,
  });

  const [isBookmarked, setIsBookmarked] = useState(true);

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkApi.removeBookmark(id) : bookmarkApi.addBookmark(id)),
    onSuccess: () => {
      // 토스트 메시지 표시
      setToastVariant("success");
      setToastMessage(
        isBookmarked ? BOOKMARK_TOAST_MESSAGE.removed : BOOKMARK_TOAST_MESSAGE.added,
      );
      setToastVisible(true);
      setIsBookmarked((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
    },
    onError: () => {
      setToastVariant("error");
      setToastMessage(BOOKMARK_TOAST_MESSAGE.error);
      setToastVisible(true);
    },
  });

  const relatedLogs = logs.slice(0, 2).map((log) => ({
    id: log.id ?? "",
    imageUrl: log.thumbnailPhotoUrl ?? "",
    author: log.authorNickname ?? "",
  }));

  return (
    <PageCard>
      <LoadingBoundary isLoading={isLoading} message="관광지 정보를 불러오는 중이에요">
        <>
          <PlaceDetailContent
            place={{
              imageUrl:
                spot?.thumbnailUrl ?? thumbnail ?? `https://picsum.photos/seed/${id}/400/300`,
              name: spot?.name ?? "",
              category: toCategory(spot?.category, spot?.name),
              description: spot?.overview ?? "",
              address: spot?.address ?? "",
              isBookmarked,
              infoItems: [
                ...(spot?.operatingHours
                  ? [
                      {
                        type: "clock" as const,
                        label: "운영시간",
                        value: spot.operatingHours,
                      },
                    ]
                  : []),
                ...(spot?.tel
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
            onBookmark={() => toggleBookmark()}
            onBack={() => router.back()}
            relatedLogs={relatedLogs}
            onViewMoreLogs={() => router.push(`/mypage/bookmarks/${id}/related-logs`)}
            getRelatedLogHref={(logId) => `/mypage/logs/${logId}`}
            onLogClick={(logId) => router.push(`/mypage/logs/${logId}`)}
          />

          <Toast
            isVisible={toastVisible}
            message={toastMessage}
            onHide={() => setToastVisible(false)}
            variant={toastVariant}
          />
        </>
      </LoadingBoundary>
    </PageCard>
  );
}
