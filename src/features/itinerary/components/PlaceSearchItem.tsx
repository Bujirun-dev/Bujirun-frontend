import Image from "next/image";
import markerIcon from "@/assets/icons/itinerary/marker-pink.png";
import { cn } from "@/shared/utils";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify" | "pending" | "uncollected";

interface PlaceSearchItemProps {
  imageUrl?: string;
  name: string;
  category: Category;
  status?: PlaceStatus;
  onClick?: () => void;
  className?: string;
}

export function PlaceSearchItem({
  imageUrl,
  name,
  category,
  status,
  onClick,
  className,
}: PlaceSearchItemProps) {
  return (
    <div
      className={cn(
        "relative flex w-full h-[81px] items-start gap-[6px] bg-white rounded-xl py-[8px] px-[10px] cursor-pointer active:opacity-80",
        className,
      )}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative w-[80px] h-[56px] rounded-lg overflow-hidden shrink-0">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1.5 min-w-0 pt-[4px]">
        <div className="flex items-center gap-1 min-w-0">
          <Image src={markerIcon} alt="위치" width={11} height={11} className="shrink-0" />
          <span className="font-paperlogy font-medium text-[12px] text-text-heading truncate min-w-0">
            {name}
          </span>
        </div>
        <CategoryChip category={category} className="self-start" />
      </div>

      {status && (
        <div className="absolute bottom-[8px] right-[10px]">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
