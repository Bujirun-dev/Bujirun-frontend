"use client";

import { forwardRef, useState } from "react";
import { PlaceSearchPanel, type SearchPlace } from "./PlaceSearchPanel";
import { PlaceDetailContent } from "./TimelinePlaceDetailPopup";
import type { ItineraryStop } from "./ItineraryTimeline";

interface TimelineSearchPopupProps {
  onClose: () => void;
  onAddToItinerary?: (place: SearchPlace) => void;
}

export const TimelineSearchPopup = forwardRef<HTMLDivElement, TimelineSearchPopupProps>(
  function TimelineSearchPopup({ onClose, onAddToItinerary }, ref) {
    const [selectedPlace, setSelectedPlace] = useState<SearchPlace | null>(null);

    const syntheticStop: ItineraryStop | null = selectedPlace
      ? {
          id: selectedPlace.id,
          time: "00:00",
          placeName: selectedPlace.name,
          imageUrl: selectedPlace.imageUrl,
          category: selectedPlace.category,
          status: selectedPlace.status === "completed" ? "completed" : "verify",
        }
      : null;

    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white px-4 py-5 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          {syntheticStop ? (
            <PlaceDetailContent
              stop={syntheticStop}
              onClose={() => setSelectedPlace(null)}
              onAdd={onAddToItinerary ? () => { onAddToItinerary(selectedPlace!); onClose(); } : undefined}
            />
          ) : (
            <PlaceSearchPanel onClose={onClose} onPlaceSelect={setSelectedPlace} />
          )}
        </div>
      </div>
    );
  },
);
