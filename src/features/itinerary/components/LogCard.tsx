import Image from "next/image";
import CalendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg";
import { cn } from "@/shared/utils";

interface LogCardProps {
  /** 대표 관광지 이름 */
  placeName: string;
  /** 추가 방문 관광지 수 */
  extraCount?: number;
  /** 작성자 닉네임 */
  author: string;
  /** 여행 기간 (당일치기, 1박2일 등) */
  duration: string;
  /** 여행 기간 */
  date: string;
  /** 다른 사람 일정에 추가된 횟수 */
  downloadCount: number;
  /** 대표 사진 URL */
  imageUrl: string;
  onClick?: () => void;
  className?: string;
}

export function LogCard({
  placeName,
  extraCount,
  author,
  duration,
  date,
  downloadCount,
  imageUrl,
  onClick,
  className,
}: LogCardProps) {
  return (
    <div
      className={cn(
        "w-full h-[223px] shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-[0px_4px_15px_0px_#d9d9d9] cursor-pointer active:opacity-80",
        className,
      )}
      onClick={onClick}
    >
      {/* 대표 사진 */}
      <div className="relative w-full h-[146px] shrink-0">
        <Image src={imageUrl} alt={placeName} fill className="object-cover" />
        <div className="absolute top-[12px] right-[14px] flex items-center justify-center gap-1 px-2 py-1 bg-white rounded-lg shadow-sm">
          <CalendarPlusIcon width={10} height={10} className="fill-sub-gray" aria-hidden />
          <span className="text-xs font-medium text-sub-gray">{downloadCount}</span>
        </div>
      </div>

      {/* 정보 */}
      <div className="px-4 py-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-normal text-text-primary flex items-center gap-1.5 tracking-[0.24px]">
          <span>📍</span>
          {placeName}
          {extraCount ? ` 외 ${extraCount}곳` : ""}
        </p>
        <p className="text-sm font-normal text-text-primary flex items-center gap-1.5 tracking-[0.24px]">
          <span>📸</span>
          {author}
        </p>
        <p className="text-sm font-normal text-text-primary flex items-center gap-1.5 tracking-[0.24px]">
          <span>📅</span>
          {duration} · {date}
        </p>
      </div>
    </div>
  );
}
