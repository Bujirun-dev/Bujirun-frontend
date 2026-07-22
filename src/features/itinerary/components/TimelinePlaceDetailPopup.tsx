import { forwardRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlaceDetailContent, StatusBadge } from "@/components";
import type { PlaceDetailInfoItem } from "@/components";
import { bookmarkApi, travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useSpotDetail } from "@/shared/hooks/useSpotDetail";
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

    // 다른 관광지 상세 화면(홈 추천/북마크)과 동일하게 실제 스팟 상세(소개글/운영시간/
    // 문의처)로 채운다. stop.description 등은 API에 없는 값이라 자리표시자로 채워져
    // 있었는데, 그걸 그대로 보여주면 가짜 정보가 나가서 여기선 쓰지 않는다.
    const { data: spotDetail } = useSpotDetail(spotId);

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
      ...(spotDetail?.operatingHours
        ? [{ type: "clock" as const, label: "운영시간", value: spotDetail.operatingHours }]
        : []),
      ...(spotDetail?.tel ? [{ type: "call" as const, label: "문의", value: spotDetail.tel }] : []),
    ];

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          <PlaceDetailContent
            onBack={onClose}
            // 검색 결과 → 상세보기(TimelineSearchPopup)의 뒤로가기 버튼과 모양을 통일한다
            // (박스 없이 작은 화살표만).
            backButtonClassName="size-auto rounded-none bg-transparent -translate-y-0.5"
            backButtonIconSize={12}
            backButtonIconClassName="icon-darkgray"
            place={{
              imageUrl: spotDetail?.thumbnailUrl || stop.imageUrl,
              name: stop.placeName,
              category: stop.category,
              description: stop.description || spotDetail?.overview || "",
              address: spotDetail?.address ?? stop.address ?? "",
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
