import Image from "next/image";
import markerIcon from "@/assets/icons/itinerary/marker-pink.png";
import { cn } from "@/shared/utils";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify" | "pending";

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
        "flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer active:opacity-80",
        className,
      )}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative w-[80px] h-[56px] rounded-lg overflow-hidden shrink-0">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1">
          <Image src={markerIcon} alt="위치" width={12} height={12} className="shrink-0" />
          <span className="font-paperlogy font-semibold text-md text-text-heading truncate">
            {name}
          </span>
        </div>
        <CategoryChip category={category} className="self-start" />
      </div>

      {status && <StatusBadge status={status} />}
    </div>
  );
}
