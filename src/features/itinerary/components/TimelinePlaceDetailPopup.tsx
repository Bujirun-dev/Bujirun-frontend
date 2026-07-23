import { forwardRef } from "react";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import { PlaceDetailContent, StatusBadge } from "@/components";
import { useSpotDetail } from "@/features/itinerary/hooks/useSpotDetail";
import type { ItineraryStop } from "./ItineraryTimeline";

interface TimelinePlaceDetailPopupProps {
  stop: ItineraryStop;
  onClose: () => void;
}

export const TimelinePlaceDetailPopup = forwardRef<HTMLDivElement, TimelinePlaceDetailPopupProps>(
  function TimelinePlaceDetailPopup({ stop, onClose }, ref) {
    const spotId = stop.spotId;

    const { place, isBookmarked, toggleBookmark, relatedLogs } = useSpotDetail(spotId, {
      name: stop.placeName,
      imageUrl: stop.imageUrl,
      category: stop.category,
      description: stop.description,
      address: stop.address,
    });

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex items-center justify-center self-start -translate-y-0.5"
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
          <PlaceDetailContent
            place={{ ...place, mapUrl: place.mapUrl ?? stop.mapUrl, isBookmarked }}
            imageOverlay={
              <div className="absolute right-2 top-2">
                <StatusBadge status={stop.status === "completed" ? "collected" : "uncollected"} />
              </div>
            }
            onBookmark={spotId ? toggleBookmark : undefined}
            relatedLogs={spotId ? relatedLogs : undefined}
            getRelatedLogHref={(logId) => `/itinerary/logs/${logId}`}
            size="compact"
          />
        </div>
      </div>
    );
  },
);
