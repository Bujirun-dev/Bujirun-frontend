import Image from "next/image";
import downloadBlueIcon from "@/assets/icons/collection/download-blue.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import markerIcon from "@/assets/icons/itinerary/marker-pink.png";
import friendsIcon from "@/assets/icons/itinerary/friends.png";
import { cn } from "@/shared/utils";

interface LogCardProps {
  imageUrl: string;
  placeName: string;
  extraCount?: number;
  author: string;
  tripType: string;
  date: string;
  downloadCount: number;
  onClick?: () => void;
  className?: string;
}

export function LogCard({
  imageUrl,
  placeName,
  extraCount,
  author,
  tripType,
  date,
  downloadCount,
  onClick,
  className,
}: LogCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[15px] overflow-hidden border border-gray-200/60 shadow-[0px_4px_15px_0px_#d9d9d9] cursor-pointer active:opacity-80",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-[146px]">
        <Image src={imageUrl} alt={placeName} fill className="object-cover" />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-[8px] px-2 py-1 shadow-sm">
          <Image src={downloadBlueIcon} alt="추가 횟수" width={10} height={10} />
          <span className="font-paperlogy text-[11px] text-sub-gray">{downloadCount}</span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <p className="font-paperlogy text-[12px] text-text-heading flex items-center gap-1.5 tracking-[0.24px]">
          <Image src={markerIcon} alt="위치" width={12} height={12} className="shrink-0" />
          {placeName}{extraCount ? ` 외 ${extraCount}곳` : ""}
        </p>
        <p className="font-paperlogy text-[12px] text-text-primary flex items-center gap-1.5 tracking-[0.24px]">
          <Image src={friendsIcon} alt="작성자" width={12} height={12} className="shrink-0" />
          {author}
        </p>
        <p className="font-paperlogy text-[12px] text-sub-gray flex items-center gap-1.5 tracking-[0.24px]">
          <Image src={calendarIcon} alt="날짜" width={12} height={12} className="shrink-0" />
          {tripType} · {date}
        </p>
      </div>
    </div>
  );
}
