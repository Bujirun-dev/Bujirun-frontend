import Image from "next/image";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";
import markerPinkIcon from "@/assets/icons/itinerary/marker-pink.png";
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
  onVerify?: () => void;
  className?: string;
}

export function PlaceCard({
  imageUrl,
  name,
  category,
  status,
  onDelete,
  onClick,
  onVerify,
  className,
}: PlaceCardProps) {
  return (
    <div
      className={cn(
        "w-[295px] h-[98px] flex bg-white rounded-[20px] overflow-hidden shadow-sm cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-[115px] h-[80px] shrink-0 self-center ml-[9px] rounded-[14px] overflow-hidden">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between px-[10px] py-[10px] relative">
        {onDelete && (
          <button
            className="absolute top-2 right-2 w-[18px] h-[18px] rounded-[6px] bg-sub-coral flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Image src={removeWhiteIcon} alt="삭제" width={10} height={10} />
          </button>
        )}

        <div className="flex flex-col gap-1 pr-8">
          <div className="flex items-center gap-[5px] min-w-0">
            <Image src={markerPinkIcon} alt="위치" width={13} height={13} className="shrink-0" />
            <span className="font-paperlogy font-medium text-[14px] text-text-heading truncate">{name}</span>
          </div>
          <CategoryChip category={category} className="self-start" />
        </div>

        {status && (
          <div className="flex justify-end">
            {status === "verify" && onVerify ? (
              <button onClick={(e) => { e.stopPropagation(); onVerify(); }}>
                <StatusBadge status={status} />
              </button>
            ) : (
              <StatusBadge status={status} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
