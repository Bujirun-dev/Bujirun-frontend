"use client";

import { usePlaceDetailQueries } from "@/shared/hooks/usePlaceDetailQueries";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageCard, Toast, LoadingBoundary } from "@/components";
import { getKakaoMapUrl } from "@/shared/utils";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getBookmarkCategory } from "@/features/mypage/utils/bookmarkCategory";
import { BOOKMARK_TOAST_MESSAGE } from "@/shared/constants/bookmark";

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

  const { detailQuery, relatedLogs } = usePlaceDetailQueries(id, {
    detail: Boolean(accessToken && id),
    logs: Boolean(accessToken && id),
  });
  const { data: spot, isLoading } = detailQuery;

  const [isBookmarked, setIsBookmarked] = useState(true);

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkApi.removeBookmark(id) : bookmarkApi.addBookmark(id)),
    onSuccess: () => {
      // 토스트 메시지 표시
      setToastVariant("success");
      setToastMessage(isBookmarked ? BOOKMARK_TOAST_MESSAGE.removed : BOOKMARK_TOAST_MESSAGE.added);
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

  return (
    <PageCard>
      <LoadingBoundary isLoading={isLoading} message="관광지 정보를 불러오는 중이에요">
        <>
          <PlaceDetailContent
            place={{
              imageUrl:
                spot?.thumbnailUrl ?? thumbnail ?? `https://picsum.photos/seed/${id}/400/300`,
              name: spot?.name ?? "",
              category: getBookmarkCategory(spot?.category, spot?.name) ?? "nature",
              description: spot?.overview ?? "",
              address: spot?.address ?? "",
              mapUrl: getKakaoMapUrl(spot?.name, spot?.lat, spot?.lng),
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
