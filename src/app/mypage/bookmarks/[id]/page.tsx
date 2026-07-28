"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton, PageCard, LoadingState, Toast } from "@/components"; // LoadingState, Toast 추가
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { travelLogApi, spotApi, bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Category } from "@/components";

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
      setToastMessage(isBookmarked ? "북마크가 해제되었어요" : "북마크에 추가되었어요");
      setToastVisible(true);
      setIsBookmarked((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
    },
  });

  const relatedLogs = logs.slice(0, 2).map((log) => ({
    id: log.id ?? "",
    imageUrl: log.thumbnailPhotoUrl ?? "",
    author: log.authorNickname ?? "",
  }));

  if (isLoading) {
    return (
      <PageCard>
        <div className="flex items-center gap-3 pb-4 shrink-0">
          <BackButton className="bg-transparent" onClick={() => router.back()} />
          <h1 className="font-ssurround font-bold text-lg text-text-heading">관광지 상세보기</h1>
        </div>
        <LoadingState message="관광지 정보를 불러오는 중이에요" />
      </PageCard>
    );
  }

  return (
    <PageCard>
      <PlaceDetailContent
        place={{
          // spot API 응답 전엔 목록에서 받은 thumbnail 사용, 그것도 없으면 플레이스홀더
          imageUrl: spot?.thumbnailUrl ?? thumbnail ?? `https://picsum.photos/seed/${id}/400/300`,
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
        onBack={() => router.back()}
        relatedLogs={relatedLogs}
        onViewMoreLogs={() => router.push(`/mypage/bookmarks/${id}/related-logs`)}
        getRelatedLogHref={(logId) => `/mypage/logs/${logId}`}
        onLogClick={(logId) => router.push(`/mypage/logs/${logId}`)}
      />

      {/* 북마크 토스트 */}
      <Toast
        isVisible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </PageCard>
  );
}
