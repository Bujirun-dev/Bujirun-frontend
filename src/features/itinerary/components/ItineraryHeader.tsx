import Image from "next/image";
import mapMagnifierIcon from "@/assets/icons/itinerary/map-magnifier.svg";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.svg";
import listIcon from "@/assets/icons/itinerary/list.svg";
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
        >
          <Image
            src={mapMagnifierIcon}
            alt="로그"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onOptimizeClick}
        >
          <Image
            src={magicWandIcon}
            alt="최적화"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>
        <button
          className="size-[28px] rounded-lg bg-system-scroll border border-main-blue/30 flex items-center justify-center"
          onClick={onTripsClick}
        >
          <Image src={listIcon} alt="목록" width={20} height={20} className="object-contain" />
        </button>
      </div>
    </div>
  );
}
