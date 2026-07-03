import Image from "next/image";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg?svgr";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import bookmarkOnIcon from "@/assets/icons/mypage/bookmark-on.png";
import bookmarkOffIcon from "@/assets/icons/mypage/bookmark-off.png";
import { cn } from "@/shared/utils";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "verify" | "pending";

interface PlaceCardProps {
  imageUrl: string;
  name: string;
  category: Category;
  status?: PlaceStatus;
  isBookmarked?: boolean;
  showBookmark?: boolean;
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
  isBookmarked = false,
  showBookmark = false,
  onDelete,
  onClick,
  onVerify,
  className,
}: PlaceCardProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 h-[98px] flex bg-main-white rounded-2xl overflow-hidden border-[0.5px] border-system-glassborder shadow-[2px_2px_10px_0px_var(--color-system-glassborder)] cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="relative w-[108px] h-[80px] shrink-0 self-center ml-2 rounded-xl overflow-hidden">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-between px-2.5 py-2.5 overflow-hidden relative">
        <div className="flex flex-col gap-1">
          <div className="flex min-w-0 items-center gap-1 pr-5">
            <MarkerIcon width={13} height={13} className="shrink-0 fill-main-blue" aria-hidden />
            <span className="font-medium text-md text-text-heading truncate">{name}</span>
          </div>
          <CategoryChip category={category} className="self-start" />
        </div>

        {status && (
          <div className="flex justify-end">
            {status === "verify" && onVerify ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVerify();
                }}
              >
                <StatusBadge status={status} />
              </button>
            ) : (
              <StatusBadge status={status} />
            )}
          </div>
        )}

        {showBookmark && (
          <Image
            src={isBookmarked ? bookmarkOnIcon : bookmarkOffIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden
            className="absolute top-[10px] right-[10px]"
          />
        )}

        {onDelete && (
          <button
            className="absolute top-[10px] right-[10px] w-[18px] h-[18px] rounded-md bg-sub-coral flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Image
              src={removeIcon}
              alt="삭제"
              width={10}
              height={10}
              className="brightness-0 invert"
            />
          </button>
        )}
      </div>
    </div>
  );
}
