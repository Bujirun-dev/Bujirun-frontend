"use client";

import Image from "next/image";
import { cn } from "@/shared/utils";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

interface PlaceDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  name: string;
  category: Category;
  status?: "completed" | "verify" | "pending";
  description: string;
  address: string;
  info?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  className?: string;
}

export function PlaceDetailSheet({
  isOpen,
  onClose,
  imageUrl,
  name,
  category,
  status,
  description,
  address,
  info,
  isBookmarked,
  onBookmark,
  className,
}: PlaceDetailSheetProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 bg-white transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      <div className="relative w-full h-[240px]">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-[32px] h-[32px] bg-white/80 rounded-full flex items-center justify-center"
        >
          <span className="font-paperlogy font-bold text-[16px] text-text-heading">‹</span>
        </button>
        {status && (
          <div className="absolute top-4 right-4">
            <StatusBadge status={status} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto h-[calc(100%-240px)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.79 1 3 2.79 3 5C3 8.25 7 13 7 13C7 13 11 8.25 11 5C11 2.79 9.21 1 7 1Z" fill="#FF7F50" />
              <circle cx="7" cy="5" r="1.5" fill="white" />
            </svg>
            <span className="font-paperlogy font-bold text-[16px] text-text-heading">{name}</span>
            <CategoryChip category={category} />
          </div>
          <button onClick={onBookmark}>
            <span className={cn("text-[20px]", isBookmarked ? "text-sub-coral" : "text-sub-lightgray")}>
              {isBookmarked ? "🔖" : "🔖"}
            </span>
          </button>
        </div>

        <section>
          <h3 className="font-paperlogy font-bold text-[14px] text-text-heading mb-1">소개</h3>
          <p className="font-paperlogy text-[13px] text-text-primary leading-relaxed">{description}</p>
        </section>

        <section>
          <h3 className="font-paperlogy font-bold text-[14px] text-text-heading mb-1">위치</h3>
          <div className="flex items-center gap-2">
            <span className="font-paperlogy text-[13px] text-text-primary">{address}</span>
            <span className="bg-sub-lightblue text-sub-deepblue font-paperlogy text-[11px] px-2 py-0.5 rounded-[6px]">
              카카오맵
            </span>
          </div>
        </section>

        {info && (
          <section>
            <h3 className="font-paperlogy font-bold text-[14px] text-text-heading mb-1">정보</h3>
            <p className="font-paperlogy text-[13px] text-text-primary leading-relaxed">{info}</p>
          </section>
        )}
      </div>
    </div>
  );
}
