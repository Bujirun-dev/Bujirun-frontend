import Image from "next/image";
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
      className={cn("flex items-center gap-3 bg-white rounded-[14px] p-3 cursor-pointer active:opacity-80", className)}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative w-[80px] h-[56px] rounded-[10px] overflow-hidden shrink-0">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
            <path d="M5 1C3.34 1 2 2.34 2 4C2 6.5 5 9 5 9C5 9 8 6.5 8 4C8 2.34 6.66 1 5 1Z" fill="#FF7F50" />
            <circle cx="5" cy="4" r="1" fill="white" />
          </svg>
          <span className="font-paperlogy font-semibold text-md text-text-heading truncate">{name}</span>
        </div>
        <CategoryChip category={category} className="self-start" />
      </div>

      {status && <StatusBadge status={status} />}
    </div>
  );
}
