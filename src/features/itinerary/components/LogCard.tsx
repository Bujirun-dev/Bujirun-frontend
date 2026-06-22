import Image from "next/image";
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
  dDay: number;
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
  dDay,
  onClick,
  className,
}: LogCardProps) {
  return (
    <div
      className={cn("bg-white rounded-[20px] overflow-hidden shadow-sm cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="relative w-full h-[180px]">
        <Image src={imageUrl} alt={placeName} fill className="object-cover" />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-[10px] px-2 py-1">
          <Image src={calendarIcon} alt="달력" width={14} height={14} />
          <span className="font-paperlogy font-bold text-sm text-text-heading">{dDay}</span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <p className="font-paperlogy font-semibold text-md text-text-heading flex items-center gap-1">
          <Image src={markerIcon} alt="위치" width={14} height={14} className="shrink-0" />
          {placeName}{extraCount ? ` 외 ${extraCount}곳` : ""}
        </p>
        <p className="font-paperlogy text-sm text-text-primary flex items-center gap-1">
          <Image src={friendsIcon} alt="작성자" width={14} height={14} className="shrink-0" />
          {author}
        </p>
        <p className="font-paperlogy text-sm text-sub-gray flex items-center gap-1">
          <Image src={calendarIcon} alt="날짜" width={14} height={14} className="shrink-0" />
          {tripType} · {date}
        </p>
      </div>
    </div>
  );
}
