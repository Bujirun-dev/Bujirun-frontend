import Image from "next/image";
import { cn } from "@/shared/utils";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify" | "pending";

interface PlaceCardProps {
  imageUrl: string;
  name: string;
  category: Category;
  status?: PlaceStatus;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export function PlaceCard({
  imageUrl,
  name,
  category,
  status,
  onDelete,
  onClick,
  className,
}: PlaceCardProps) {
  return (
    <div
      className={cn(
        "flex bg-white rounded-[20px] overflow-hidden shadow-sm cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-[110px] shrink-0">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between px-3 py-3 relative">
        {onDelete && (
          <button
            className="absolute top-2 right-2 w-[28px] h-[28px] rounded-full bg-sub-coral flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5.5 3.5V2.5h3v1M3.5 3.5l.5 8h6l.5-8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div className="flex flex-col gap-1 pr-8">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11C6 11 9.5 7.25 9.5 4.5C9.5 2.57 7.93 1 6 1Z" fill="#FF7F50" />
              <circle cx="6" cy="4.5" r="1.2" fill="white" />
            </svg>
            <span className="font-paperlogy font-bold text-[13px] text-text-heading">{name}</span>
          </div>
          <CategoryChip category={category} size="sm" />
        </div>

        {status && (
          <div className="flex justify-end">
            <StatusBadge status={status} />
          </div>
        )}
      </div>
    </div>
  );
}
