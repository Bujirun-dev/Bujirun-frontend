import { forwardRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import BookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg?svgr";
import BookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg?svgr";
import CallIcon from "@/assets/icons/itinerary/call.svg?svgr";
import ClockIcon from "@/assets/icons/itinerary/clock.svg?svgr";
import FeeIcon from "@/assets/icons/itinerary/fee.svg?svgr";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg?svgr";
import PlusIcon from "@/assets/icons/itinerary/plus-small.svg?svgr";
import ParkingIcon from "@/assets/icons/itinerary/parking.svg?svgr";
import rightIcon from "@/assets/icons/itinerary/right-gray.svg?url";
import { Card, CategoryChip, StatusBadge } from "@/components";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import type { ItineraryStop } from "./ItineraryTimeline";

const INFO_ICON_CLASS = "h-3 w-3 fill-sub-deepblue";
function getFallbackRelatedLogs(placeName: string) {
  const normalizedPlaceName = placeName.replace(/\s/g, "");

  return SAMPLE_LOGS.filter((log) =>
    log.days.some((day) =>
      day.stops.some((stop) => {
        const normalizedLogPlaceName = stop.place.replace(/\s/g, "");
        return (
          normalizedLogPlaceName === normalizedPlaceName ||
          normalizedLogPlaceName.includes(normalizedPlaceName) ||
          normalizedPlaceName.includes(normalizedLogPlaceName)
        );
      }),
    ),
  )
    .slice(0, 4)
    .map((log) => ({
      id: log.id,
      imageUrl: log.imageUrl,
      userName: log.author,
    }));
}

interface PlaceDetailContentProps {
  stop: ItineraryStop;
  onClose: () => void;
  onAdd?: () => void;
}

export function PlaceDetailContent({ stop, onClose, onAdd }: PlaceDetailContentProps) {
  const [bookmarked, setBookmarked] = useState(Boolean(stop.isBookmarked));
  const isCollected = stop.status === "completed";
  const description =
    stop.description ??
    `${stop.placeName}은(는) 부산 여행 일정에서 방문하기 좋은 관광지입니다. 주변 동선과 함께 둘러보기 좋아요.`;
  const address = stop.address ?? "주소 정보가 없습니다.";
  const operatingHours = stop.operatingHours || "운영 정보가 없습니다.";
  const relatedLogs = stop.relatedLogs?.length
    ? stop.relatedLogs
    : getFallbackRelatedLogs(stop.placeName);
  const infoItems = [
    { icon: ClockIcon, label: "운영시간", value: operatingHours },
    { icon: FeeIcon, label: "입장료", value: stop.fee ?? "무료" },
    { icon: ParkingIcon, label: "주차", value: stop.parking ?? "주차 정보 없음" },
    { icon: CallIcon, label: "문의", value: stop.phone ?? "문의처 정보 없음" },
  ];

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center -translate-y-0.5"
          aria-label="관광지 상세 닫기"
        >
          <Image
            src={angleLeftIcon}
            alt=""
            width={12}
            height={12}
            className="icon-darkgray"
            aria-hidden
          />
        </button>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex size-[18px] shrink-0 items-center justify-center rounded-md bg-sub-coral active:opacity-70"
            aria-label="내 일정에 추가"
          >
            <PlusIcon width={16} height={16} className="text-main-white" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setBookmarked((prev) => !prev)}
            className="relative -right-1 -top-1 flex size-6 items-center justify-center"
            aria-label={bookmarked ? "북마크 해제" : "북마크"}
          >
            {bookmarked ? (
              <BookmarkOnIcon width={12} height={12} className="fill-main-blue" aria-hidden />
            ) : (
              <BookmarkOffIcon width={12} height={12} className="fill-sub-darkgray" aria-hidden />
            )}
          </button>
        )}
      </div>

      <div className="relative h-[145px] w-full shrink-0 overflow-hidden rounded-[10px]">
        <Image src={stop.imageUrl} alt={stop.placeName} fill className="object-cover object-top" />
        <div className="absolute right-2 top-2">
          <StatusBadge status={isCollected ? "collected" : "uncollected"} />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-b-[0.3px] border-sub-lightgray pb-2.5 pt-3">
        <div className="flex min-w-0 items-center">
          <MarkerIcon width={12} height={12} className="mr-1 shrink-0 fill-sub-pink" aria-hidden />
          <h2 className="mr-3 truncate text-md font-medium text-text-heading">{stop.placeName}</h2>
          <CategoryChip category={stop.category} size="sm" className="shrink-0" />
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={() => setBookmarked((prev) => !prev)}
            className="relative ml-2 flex size-6 shrink-0 items-center justify-center"
            aria-label={bookmarked ? "북마크 해제" : "북마크"}
          >
            {bookmarked ? (
              <BookmarkOnIcon width={12} height={12} className="fill-main-blue" aria-hidden />
            ) : (
              <BookmarkOffIcon width={12} height={12} className="fill-sub-darkgray" aria-hidden />
            )}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <section className="border-b-[0.3px] border-sub-lightgray py-3">
          <h3 className="mb-2.5 text-xs font-semibold text-text-heading">소개</h3>
          <p className="text-xs font-normal leading-relaxed text-text-primary">{description}</p>
        </section>

        <section className="border-b-[0.3px] border-sub-lightgray py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <h3 className="text-xs font-semibold text-text-heading">위치</h3>
            <a
              href={stop.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-[5px] bg-sub-violet px-1 py-0.5"
            >
              <Image src={kakaoMapIcon} alt="카카오맵" width={37} height={11} />
            </a>
          </div>
          <p className="text-xs font-normal leading-relaxed text-text-primary">{address}</p>
        </section>

        <section className="border-b-[0.3px] border-sub-lightgray py-3">
          <h3 className="mb-2.5 text-xs font-semibold text-text-heading">정보</h3>
          <Card
            variant="glass-sm"
            className="rounded-[18px] border-[0.5px] border-system-scroll px-3 py-3"
          >
            <div className="flex flex-col gap-2">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="grid grid-cols-[22px_1fr_auto] items-center gap-2"
                  >
                    <div className="flex size-[22px] items-center justify-center rounded-[5px] border-[0.5px] border-system-scroll bg-system-navbg">
                      <Icon className={INFO_ICON_CLASS} aria-hidden />
                    </div>
                    <span className="text-xs font-medium text-text-heading">{item.label}</span>
                    <span className="text-right text-xs font-medium text-text-heading">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="py-3">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-heading">관련 로그</h3>
            <Link
              href="/itinerary/logs"
              className="flex items-center gap-1 text-2xs font-semibold text-sub-gray"
            >
              더보기
              <Image src={rightIcon} alt="" width={6} height={10} aria-hidden />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {relatedLogs.map((log) => (
              <Link
                key={log.id}
                href={`/itinerary/logs/${log.id}`}
                className="relative h-[67px] w-[106px] shrink-0 overflow-hidden rounded-lg"
              >
                <Image src={log.imageUrl} alt={`${log.userName} 로그`} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-text-heading/55 to-transparent" />
                <span className="absolute bottom-2 left-2 rounded-[5px] bg-system-blackbg px-2 py-1 text-3xs font-medium text-main-white">
                  {log.userName}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

interface TimelinePlaceDetailPopupProps {
  stop: ItineraryStop;
  onClose: () => void;
}

export const TimelinePlaceDetailPopup = forwardRef<HTMLDivElement, TimelinePlaceDetailPopupProps>(
  function TimelinePlaceDetailPopup({ stop, onClose }, ref) {
    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          <PlaceDetailContent stop={stop} onClose={onClose} />
        </div>
      </div>
    );
  },
);
