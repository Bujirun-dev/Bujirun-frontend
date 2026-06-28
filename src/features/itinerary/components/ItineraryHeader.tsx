import Image from "next/image";
import listIcon from "@/assets/icons/itinerary/list.svg?url";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.svg?url";
import mapMagnifierIcon from "@/assets/icons/itinerary/map-magnifier.svg?url";
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
    <div className="flex items-center gap-2.5 pb-3.5">
      <DayBadge day={currentDay + 1} />
      <span className="flex-1 text-lg font-bold text-sub-deepblue">{tripName}</span>
      <div className="flex items-center gap-1">
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onLogsClick}
          aria-label="로그"
        >
          <Image src={mapMagnifierIcon} alt="" width={20} height={20} aria-hidden />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onOptimizeClick}
          aria-label="최적화"
        >
          <Image src={magicWandIcon} alt="" width={20} height={20} aria-hidden />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onTripsClick}
          aria-label="목록"
        >
          <Image src={listIcon} alt="" width={20} height={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
