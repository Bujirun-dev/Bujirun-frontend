import { forwardRef } from "react";
import { PlaceDetailContent, StatusBadge } from "@/components";
import type { PlaceDetailInfoItem } from "@/components";
import { useSpotDetail } from "@/features/itinerary/hooks/useSpotDetail";
import type { ItineraryStop } from "./ItineraryTimeline";

interface TimelinePlaceDetailPopupProps {
  stop: ItineraryStop;
  onClose: () => void;
}

export const TimelinePlaceDetailPopup = forwardRef<HTMLDivElement, TimelinePlaceDetailPopupProps>(
  function TimelinePlaceDetailPopup({ stop, onClose }, ref) {
    const spotId = stop.spotId;
    const { spot, isBookmarked, toggleBookmark, relatedLogs } = useSpotDetail(spotId);

    const infoItems: PlaceDetailInfoItem[] = [
      {
        type: "clock",
        label: "운영",
        value: spot?.operatingHours || "운영 정보가 없습니다.",
      },
      { type: "call", label: "문의", value: spot?.tel || "문의처 정보가 없습니다." },
    ];

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          <PlaceDetailContent
            onBack={onClose}
            place={{
              imageUrl: stop.imageUrl,
              name: stop.placeName,
              category: stop.category,
              description: spot?.overview || stop.description || "",
              address: stop.address || spot?.address || "",
              mapUrl: stop.mapUrl,
              isBookmarked,
              infoItems,
            }}
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
