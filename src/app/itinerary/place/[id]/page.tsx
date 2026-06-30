import Image from "next/image";
import { notFound } from "next/navigation";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg?url";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg?url";
import { BackButton, Button, PageCard } from "@/components";
import { PlaceDetailContent } from "@/components/place/PlaceDetailContent";
import { getPlaceById, getPlaces, getSchedules } from "@/mocks";
import { getCategoryFromKo } from "@/shared/constants/category";
import { FALLBACK_IMAGE } from "@/features/itinerary/utils/scheduleUtils";
import type { Place } from "@/shared/types";

function resolvePlace(id: string): Place | undefined {
  const directPlace = getPlaceById(id) ?? getPlaces().find((place) => place.contentId === id);
  if (directPlace) return directPlace;

  for (const schedule of getSchedules()) {
    for (const day of schedule.days) {
      const item = day.items.find((scheduleItem) => scheduleItem.id === id);
      if (item) return getPlaceById(item.spotId);
    }
  }

  return undefined;
}

function getPlaceDescription(placeName: string): string {
  return `${placeName}은(는) 부산 여행 일정에서 방문하기 좋은 관광지입니다. 주변 관광지와 함께 둘러보기 좋고, 일정 중 잠시 머물며 분위기를 느끼기 좋은 장소예요.`;
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = resolvePlace(id);
  if (!place) notFound();

  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

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
            { type: "clock", label: "운영", value: place.operatingHours || "운영 정보가 없습니다." },
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
        footer={<Button variant="primary">+ 일정에 추가</Button>}
      />
    </PageCard>
  );
}
