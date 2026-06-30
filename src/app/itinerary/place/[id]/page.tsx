import Image from "next/image";
import { notFound } from "next/navigation";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg?url";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg?url";
import { BackButton, Button, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { getRelatedLogsByPlaceName } from "@/features/mypage/data/relatedLogs";
import { getCategoryFromKo } from "@/shared/constants/category";
import { FALLBACK_IMAGE } from "@/features/itinerary/utils/scheduleUtils";
import { getPlaceDescription, resolveItineraryPlace } from "@/features/itinerary/utils/placeDetail";

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = resolveItineraryPlace(id);
  if (!place) notFound();

  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
  const relatedLogs = getRelatedLogsByPlaceName(place.name);

  return (
    <PageCard>
      <PlaceDetailContent
        place={{
          imageUrl: place.thumbnailUrl || FALLBACK_IMAGE,
          name: place.name,
          category: getCategoryFromKo(place.category),
          description: getPlaceDescription(place.name),
          address: place.address,
          mapUrl,
          isBookmarked: place.isCollected,
          infoItems: [
            {
              type: "clock",
              label: "운영",
              value: place.operatingHours || "운영 정보가 없습니다.",
            },
            { type: "call", label: "문의", value: "문의처 정보가 없습니다." },
          ],
        }}
        imageOverlay={
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <BackButton className="rounded-full bg-main-white/85 shadow-[0_2px_8px_0_var(--color-system-scroll)]" />
            <div className="flex size-[32px] items-center justify-center rounded-full bg-main-white/85 shadow-[0_2px_8px_0_var(--color-system-scroll)]">
              <Image
                src={place.isCollected ? bookmarkOnIcon : bookmarkOffIcon}
                alt={place.isCollected ? "수집됨" : "미수집"}
                width={18}
                height={18}
              />
            </div>
          </div>
        }
        relatedLogs={relatedLogs}
        relatedLogsHref={`/itinerary/place/${id}/related-logs`}
        getRelatedLogHref={(logId) => `/itinerary/logs/${logId}`}
        footer={<Button variant="primary">+ 일정에 추가</Button>}
      />
    </PageCard>
  );
}
