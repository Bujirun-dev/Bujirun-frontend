import Image from "next/image";
import markerIcon from "@/assets/icons/itinerary/marker.svg";
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
        "relative flex h-[81px] w-full cursor-pointer items-start gap-1.5 rounded-xl bg-white px-2.5 py-2 active:opacity-80",
        className,
      )}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
        <div className="flex min-w-0 items-center gap-1">
          <Image src={markerIcon} alt="위치" width={11} height={11} className="shrink-0 icon-pink" />
          <span className="min-w-0 truncate text-sm font-medium text-text-heading">{name}</span>
        </div>
        <CategoryChip category={category} size="sm" className="self-start" />
      </div>

      {status && (
        <div className="absolute bottom-2 right-2.5">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
