import Image from "next/image";
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
          <span className="text-xs">🗓</span>
          <span className="font-paperlogy font-bold text-sm text-text-heading">{dDay}</span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <p className="font-paperlogy font-semibold text-md text-text-heading">
          📍 {placeName}{extraCount ? ` 외 ${extraCount}곳` : ""}
        </p>
        <p className="font-paperlogy text-sm text-text-primary">🎫 {author}</p>
        <p className="font-paperlogy text-sm text-sub-gray">
          📅 {tripType} · {date}
        </p>
      </div>
    </div>
  );
}
