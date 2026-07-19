"use client";

import { forwardRef, useState } from "react";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?url";
import PlusIcon from "@/assets/icons/itinerary/plus-small.svg?svgr";
import { PlaceDetailContent } from "@/components";
import { PlaceSearchPanel, type SearchPlace } from "./PlaceSearchPanel";

interface TimelineSearchPopupProps {
  onClose: () => void;
  onAddToItinerary?: (place: SearchPlace) => void;
}

export const TimelineSearchPopup = forwardRef<HTMLDivElement, TimelineSearchPopupProps>(
  function TimelineSearchPopup({ onClose, onAddToItinerary }, ref) {
    const [selectedPlace, setSelectedPlace] = useState<SearchPlace | null>(null);

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          {selectedPlace ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
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
                place={{
                  imageUrl: selectedPlace.imageUrl,
                  name: selectedPlace.name,
                  category: selectedPlace.category,
                  description: "",
                  address: "",
                }}
                size="compact"
              />
            </>
          ) : (
            <PlaceSearchPanel onClose={onClose} onPlaceSelect={setSelectedPlace} />
          )}
        </div>
      </div>
    );
  },
);
