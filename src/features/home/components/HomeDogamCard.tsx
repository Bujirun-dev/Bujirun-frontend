import Image from "next/image";
import { cn } from "@/shared/utils";

interface HomeDogamCardProps {
  mapImageUrl: string;
  collectedCount: number;
  totalCount: number;
  progressMessage?: string;
  onClick?: () => void;
  className?: string;
}

export function HomeDogamCard({
  mapImageUrl,
  collectedCount,
  totalCount,
  progressMessage,
  onClick,
  className,
}: HomeDogamCardProps) {
  const percent = Math.round((collectedCount / totalCount) * 100);

  return (
    <div
      className={cn(
        "bg-white/60 backdrop-blur-sm rounded-[20px] overflow-hidden cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-[120px]">
        <Image src={mapImageUrl} alt="부산 도감" fill className="object-cover" />
        <div className="absolute bottom-2 right-3">
          <span className="font-paperlogy font-bold text-[13px] text-text-heading bg-white/80 px-2 py-0.5 rounded-full">
            {collectedCount} / {totalCount}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="font-paperlogy font-bold text-[13px] text-text-heading">부산도감</span>
          <span className="font-paperlogy text-[12px] text-sub-gray">부산의 장소를 방문하고 도감을 채워보세요.</span>
        </div>

        <div className="w-full h-[4px] bg-sub-lightblue rounded-full overflow-hidden">
          <div
            className="h-full bg-main-blue rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {progressMessage && (
          <p className="font-paperlogy text-[11px] text-sub-gray">{progressMessage}</p>
        )}
      </div>
    </div>
  );
}
