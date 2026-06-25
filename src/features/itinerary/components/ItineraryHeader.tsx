import Image from "next/image";
import mapMagnifierIcon from "@/assets/icons/itinerary/map-magnifier.png";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.png";
import listIcon from "@/assets/icons/itinerary/list.png";

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
    <div className="flex items-center gap-[10px] px-[10px] pb-[15px]">
      <div className="flex items-center rounded-[10px] bg-main-blue px-[10px] py-[5px] shrink-0">
        <span className="font-ssurround text-[14px] font-bold text-white tracking-[0.5px] leading-[18px]">
          day {currentDay + 1}
        </span>
      </div>
      <span className="flex-1 font-paperlogy text-[16px] font-bold text-sub-deepblue">{tripName}</span>
      <div className="flex items-center gap-[5px]">
        <button
          className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
          onClick={onLogsClick}
        >
          <Image src={mapMagnifierIcon} alt="로그" width={20} height={20} className="object-contain" />
        </button>
        <button
          className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
          onClick={onOptimizeClick}
        >
          <Image src={magicWandIcon} alt="최적화" width={20} height={20} className="object-contain" />
        </button>
        <button
          className="size-[28px] rounded-[10px] bg-[#d5e6ff] border border-main-blue/30 flex items-center justify-center"
          onClick={onTripsClick}
        >
          <Image src={listIcon} alt="목록" width={20} height={20} className="object-contain" />
        </button>
      </div>
    </div>
  );
}
