import { forwardRef } from "react";
import { PlaceSearchPanel } from "./PlaceSearchPanel";

interface TimelineSearchPopupProps {
  onClose: () => void;
}

export const TimelineSearchPopup = forwardRef<HTMLDivElement, TimelineSearchPopupProps>(
  function TimelineSearchPopup({ onClose }, ref) {
    return (
      <div ref={ref} className="absolute left-[52px] right-0 top-0 z-20 pl-3">
        <div className="flex h-[470px] w-full flex-col overflow-hidden rounded-3xl border-[0.5px] border-system-glassborder bg-main-white p-4 shadow-[2px_2px_10px_0px_var(--color-system-glassborder)]">
          <PlaceSearchPanel onClose={onClose} />
        </div>
      </div>
    );
  },
);
