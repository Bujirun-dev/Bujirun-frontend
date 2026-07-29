"use client";

import { forwardRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import PlusIcon from "@/assets/icons/itinerary/plus-small.svg?svgr";
import { PlaceDetailContent, StatusBadge } from "@/components";
import { useSpotDetail } from "@/features/itinerary/hooks/useSpotDetail";
import { PlaceSearchPanel, type SearchPlace } from "./PlaceSearchPanel";

interface TimelineSearchPopupProps {
  onClose: () => void;
  onAddToItinerary?: (place: SearchPlace) => void;
}

function SelectedPlacePreview({
  selectedPlace,
  onBackToSearch,
  onAddToItinerary,
  onClose,
}: {
  selectedPlace: SearchPlace;
  onBackToSearch: () => void;
  onAddToItinerary?: (place: SearchPlace) => void;
  onClose: () => void;
}) {
  const { place, toggleBookmark, relatedLogs } = useSpotDetail(selectedPlace.id, {
    name: selectedPlace.name,
    imageUrl: selectedPlace.imageUrl,
    category: selectedPlace.category,
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSearch}
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
        {onAddToItinerary && (
          <button
            type="button"
            onClick={() => {
              onAddToItinerary(selectedPlace);
              onClose();
            }}
            className="flex size-[18px] shrink-0 -translate-y-0.5 items-center justify-center rounded-md bg-sub-coral active:opacity-70"
            aria-label="내 일정에 추가"
          >
            <PlusIcon width={16} height={16} className="text-main-white" aria-hidden />
          </button>
        )}
      </div>

      <PlaceDetailContent
        place={place}
        imageOverlay={
          <div className="absolute right-2 top-2">
            <StatusBadge
              status={selectedPlace.status === "completed" ? "collected" : "uncollected"}
            />
          </div>
        }
        onBookmark={toggleBookmark}
        relatedLogs={relatedLogs}
        size="compact"
      />
    </>
  );
}

// 예전엔 타임라인 위에 top-0으로 꽉 덮는 카드였는데, 이미 추가된 일정이 전부 가려져서
// 뭐가 있는지 안 보인 채로 검색해야 했다 — 바텀시트로 바꿔서 화면 위쪽(이미 추가된
// 일정)이 살짝 보이게 한다. app-root에 포탈로 렌더링해야 화면 전체 높이 기준으로
// bottom-0이 잡힌다(원래 위치에 그대로 두면 이 컴포넌트를 감싼 좁은 relative 부모
// 기준으로 붙어서 바텀시트처럼 안 보인다) — Modal.tsx와 동일한 포탈 패턴.
export const TimelineSearchPopup = forwardRef<HTMLDivElement, TimelineSearchPopupProps>(
  function TimelineSearchPopup({ onClose, onAddToItinerary }, ref) {
    const [selectedPlace, setSelectedPlace] = useState<SearchPlace | null>(null);

    if (typeof document === "undefined") return null;
    const appRoot = document.getElementById("app-root");
    if (!appRoot) return null;

    return createPortal(
      <div
        className="absolute inset-0 z-40"
        style={{ backgroundColor: "var(--color-system-blackbg)" }}
        onClick={onClose}
      >
        <motion.div
          ref={ref}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 z-50 flex h-[65dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-main-white px-4 py-5 shadow-[0px_-2px_10px_0px_var(--color-system-glassborder)]"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedPlace ? (
            <SelectedPlacePreview
              selectedPlace={selectedPlace}
              onBackToSearch={() => setSelectedPlace(null)}
              onAddToItinerary={onAddToItinerary}
              onClose={onClose}
            />
          ) : (
            <PlaceSearchPanel onClose={onClose} onPlaceSelect={setSelectedPlace} />
          )}
        </motion.div>
      </div>,
      appRoot,
    );
  },
);
