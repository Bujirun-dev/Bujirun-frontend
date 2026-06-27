import MapMagnifierIcon from "@/assets/icons/itinerary/map-magnifier.svg";
import MagicWandIcon from "@/assets/icons/itinerary/magic-wand.svg";
import ListIcon from "@/assets/icons/itinerary/list.svg";
import { DayBadge } from "./DayBadge";

interface ItineraryHeaderProps {
  currentDay: number;
  tripName: string;
  onLogsClick: () => void;
  onOptimizeClick: () => void;
  onTripsClick: () => void;
}

export function ItineraryHeader({
  currentDay,
  tripName,
  onLogsClick,
  onOptimizeClick,
  onTripsClick,
}: ItineraryHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 pb-3.5">
      <DayBadge day={currentDay + 1} />
      <span className="flex-1 text-lg font-bold text-sub-deepblue">{tripName}</span>
      <div className="flex items-center gap-1">
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onLogsClick}
          aria-label="로그"
        >
          <MapMagnifierIcon width={20} height={20} aria-hidden />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onOptimizeClick}
          aria-label="최적화"
        >
          <MagicWandIcon width={20} height={20} aria-hidden />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onTripsClick}
          aria-label="목록"
        >
          <ListIcon width={20} height={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
