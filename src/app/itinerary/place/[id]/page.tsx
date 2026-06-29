import Image from "next/image";
import { notFound } from "next/navigation";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg?url";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg?url";
import callIcon from "@/assets/icons/itinerary/call.svg?url";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import markerIcon from "@/assets/icons/itinerary/marker.svg?url";
import { BackButton, Button, CategoryChip, PageCard } from "@/components";
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
    <PageCard className="px-0">
      <div className="relative h-[220px] w-full shrink-0">
        <Image
          src={place.thumbnailUrl || FALLBACK_IMAGE}
          alt={place.name}
          fill
          className="object-cover"
        />
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
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-5 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Image src={markerIcon} alt="" width={15} height={15} className="icon-pink" />
            <h1 className="truncate text-xl font-bold text-text-heading">{place.name}</h1>
          </div>
          <CategoryChip category={getCategoryFromKo(place.category)} className="self-start" />
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-md font-bold text-text-heading">소개</h2>
          <p className="text-sm leading-relaxed text-text-primary">
            {getPlaceDescription(place.name)}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-bold text-text-heading">위치</h2>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[22px] items-center rounded-md bg-sub-lightblue px-1.5"
            >
              <Image src={kakaoMapIcon} alt="카카오맵" width={66} height={16} />
            </a>
          </div>
          <p className="text-sm leading-relaxed text-text-primary">{place.address}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-md font-bold text-text-heading">정보</h2>
          <div className="flex items-start gap-2 text-sm text-text-primary">
            <span className="shrink-0 font-semibold text-sub-gray">운영</span>
            <span>{place.operatingHours || "운영 정보가 없습니다."}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sub-gray">
            <Image src={callIcon} alt="" width={14} height={14} aria-hidden />
            <span>문의처 정보가 없습니다.</span>
          </div>
        </section>
      </div>

      <div className="px-5 pb-6 pt-3">
        <Button variant="primary">+ 일정에 추가</Button>
      </div>
    </PageCard>
  );
}
