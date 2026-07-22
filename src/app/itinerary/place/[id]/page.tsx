"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg?url";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg?url";
import { BackButton, Button, PageCard, LoadingState, ErrorState } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { getCategoryFromKo } from "@/shared/constants/category";
import { useSpotDetail } from "@/features/itinerary/hooks/useSpotDetail";

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { spot, isLoading, isError, isBookmarked, toggleBookmark, relatedLogs } =
    useSpotDetail(id);

  if (isLoading) {
    return (
      <PageCard>
        <LoadingState message="관광지 정보를 불러오는 중이에요" />
      </PageCard>
    );
  }

  if (isError || !spot || !spot.name) {
    return (
      <PageCard>
        <ErrorState
          code={404}
          title="관광지를 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 페이지예요."
        />
      </PageCard>
    );
  }

  const category = getCategoryFromKo(spot.category ?? "");
  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(spot.name)},${spot.lat ?? ""},${spot.lng ?? ""}`;

  return (
    <PageCard>
      <PlaceDetailContent
        place={{
          imageUrl: spot.thumbnailUrl ?? `https://picsum.photos/seed/${id}/400/300`,
          name: spot.name,
          category,
          description: spot.overview ?? "",
          address: spot.address ?? "",
          mapUrl,
          isBookmarked,
          infoItems: [
            {
              type: "clock",
              label: "운영",
              value: spot.operatingHours || "운영 정보가 없습니다.",
            },
            { type: "call", label: "문의", value: spot.tel || "문의처 정보가 없습니다." },
          ],
        }}
        onBookmark={toggleBookmark}
        imageOverlay={
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <BackButton className="rounded-full bg-main-white/85 shadow-[0_2px_8px_0_var(--color-system-scroll)]" />
            <div className="flex size-[32px] items-center justify-center rounded-full bg-main-white/85 shadow-[0_2px_8px_0_var(--color-system-scroll)]">
              <Image
                src={isBookmarked ? bookmarkOnIcon : bookmarkOffIcon}
                alt={isBookmarked ? "수집됨" : "미수집"}
                width={18}
                height={18}
              />
            </div>
          </div>
        }
        relatedLogs={relatedLogs}
        onViewMoreLogs={() =>
          router.push(
            `/itinerary/place/${id}/related-logs?placeName=${encodeURIComponent(spot.name ?? "")}&category=${category}`,
          )
        }
        getRelatedLogHref={(logId) => `/itinerary/logs/${logId}`}
        onLogClick={(logId) => router.push(`/itinerary/logs/${logId}`)}
        // TODO: 실제 일정 담기 플로우(대상 일정/day 선택) 연동 필요
        footer={<Button variant="primary">+ 일정에 추가</Button>}
      />
    </PageCard>
  );
}
