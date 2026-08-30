"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PageCard, ErrorState, Toast, LoadingBoundary } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { useSpotDetail } from "@/features/itinerary/hooks/useSpotDetail";
import { BOOKMARK_TOAST_MESSAGE } from "@/shared/constants/bookmark";

export default function BookmarkSpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { spot, place, isLoading, isError, isBookmarked, toggleBookmark, relatedLogs } =
    useSpotDetail(id);

  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleBookmark = async () => {
    try {
      await toggleBookmark();

      setToastVariant("success");
      setToastMessage(isBookmarked ? BOOKMARK_TOAST_MESSAGE.removed : BOOKMARK_TOAST_MESSAGE.added);
      setToastVisible(true);
    } catch {
      setToastVariant("error");
      setToastMessage(BOOKMARK_TOAST_MESSAGE.error);
      setToastVisible(true);
    }
  };

  return (
    <PageCard>
      <LoadingBoundary isLoading={isLoading} message="관광지 정보를 불러오는 중이에요">
        {isError || !spot || !spot.name ? (
          <ErrorState
            code={404}
            title="관광지를 찾을 수 없어요"
            description="삭제되었거나 존재하지 않는 페이지예요."
            primaryAction={{
              label: "북마크로 돌아가기",
              onClick: () => router.push("/mypage/bookmarks"),
            }}
          />
        ) : (
          <>
            <PlaceDetailContent
              place={place}
              onBack={() => router.back()}
              onBookmark={handleBookmark}
              relatedLogs={relatedLogs}
              onViewMoreLogs={() =>
                router.push(
                  `/mypage/bookmarks/spot/${id}/related-logs?placeName=${encodeURIComponent(place.name)}&category=${place.category}`,
                )
              }
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
        )}
      </LoadingBoundary>
    </PageCard>
  );
}
