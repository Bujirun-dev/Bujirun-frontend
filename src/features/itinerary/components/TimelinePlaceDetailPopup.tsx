import { forwardRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import { PlaceDetailContent, StatusBadge } from "@/components";
import type { PlaceDetailInfoItem } from "@/components";
import { bookmarkApi, travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { ItineraryStop } from "./ItineraryTimeline";

interface TimelinePlaceDetailPopupProps {
  stop: ItineraryStop;
  onClose: () => void;
}

export const TimelinePlaceDetailPopup = forwardRef<HTMLDivElement, TimelinePlaceDetailPopupProps>(
  function TimelinePlaceDetailPopup({ stop, onClose }, ref) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();
    const spotId = stop.spotId;

    // 다른 화면(관광지 상세보기)과 동일하게 실제 북마크 목록/토글, 관련 로그 API로 연결한다.
    const { data: bookmarks = [] } = useQuery({
      queryKey: bookmarkApi.keys.list(),
      queryFn: bookmarkApi.getBookmarks,
      enabled: Boolean(accessToken),
    });
    const isBookmarked = bookmarks.some((bookmark) => bookmark.spotId === spotId);

    const { mutate: toggleBookmark } = useMutation({
      mutationFn: () =>
        spotId
          ? isBookmarked
            ? bookmarkApi.removeBookmark(spotId)
            : bookmarkApi.addBookmark(spotId)
          : Promise.reject(new Error("spotId missing")),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
      },
    });

    const { data: logs = [] } = useQuery({
      queryKey: travelLogApi.keys.bySpot(spotId ?? ""),
      queryFn: () => travelLogApi.getLogsBySpot(spotId as string),
      enabled: Boolean(accessToken && spotId),
    });
    const relatedLogs = logs.slice(0, 2).map((log) => ({
      id: log.id ?? "",
      imageUrl: log.thumbnailPhotoUrl ?? "",
      author: log.authorNickname ?? "",
    }));

    const infoItems: PlaceDetailInfoItem[] = [
      ...(stop.operatingHours
        ? [{ type: "clock" as const, label: "운영시간", value: stop.operatingHours }]
        : []),
      ...(stop.fee ? [{ type: "fee" as const, label: "입장료", value: stop.fee }] : []),
      ...(stop.parking ? [{ type: "parking" as const, label: "주차", value: stop.parking }] : []),
      ...(stop.phone ? [{ type: "call" as const, label: "문의", value: stop.phone }] : []),
    ];

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
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
          </div>

          <PlaceDetailContent
            place={{
              imageUrl: stop.imageUrl,
              name: stop.placeName,
              category: stop.category,
              description: stop.description ?? "",
              address: stop.address ?? "",
              mapUrl: stop.mapUrl,
              isBookmarked,
              infoItems,
            }}
            imageOverlay={
              <div className="absolute right-2 top-2">
                <StatusBadge status={stop.status === "completed" ? "collected" : "uncollected"} />
              </div>
            }
            onBookmark={spotId ? () => toggleBookmark() : undefined}
            relatedLogs={spotId ? relatedLogs : undefined}
            getRelatedLogHref={(logId) => `/itinerary/logs/${logId}`}
            size="compact"
          />
        </div>
      </div>
    );
  },
);
