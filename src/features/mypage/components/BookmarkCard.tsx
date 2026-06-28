"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg?svgr";
import bookmarkOnIcon from "@/assets/icons/mypage/bookmark-on.png";
import bookmarkOffIcon from "@/assets/icons/mypage/bookmark-off.png";
import { CategoryChip, StatusBadge } from "@/components";
import type { Category } from "@/components";

type StatusType = "completed" | "verify" | "pending" | "uncollected" | "collected";

interface BookmarkCardProps {
  imageUrl?: StaticImageData | string;
  name: string;
  category: Category;
  status?: StatusType;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onClick?: () => void;
}

export function BookmarkCard({
  imageUrl,
  name,
  category,
  status,
  isBookmarked = true,
  onBookmarkToggle,
  onClick,
}: BookmarkCardProps) {
  return (
    <div
      className="relative flex h-[117px] w-full cursor-pointer items-start gap-3 rounded-[20px] border-[0.3px] border-sub-lightblue bg-main-white px-[14px] py-[13px] shadow-[2px_2px_6px_#ECF5FF] active:opacity-80"
      onClick={onClick}
    >
      {/* 썸네일 */}
      {imageUrl && (
        <div className="relative h-[91px] w-[136px] shrink-0 overflow-hidden rounded-[15px] border-[0.3px] border-system-glassborder">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between h-[91px]">
        {/* 상단: 관광지명 + 북마크 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MarkerIcon width={13} height={13} className="shrink-0 fill-sub-pink" aria-hidden />
            <span className="text-md font-medium text-text-heading tracking-[-0.3px]">{name}</span>
          </div>
          <button
            type="button"
            aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle?.();
            }}
            className="shrink-0 active:opacity-70"
          >
            <Image
              src={isBookmarked ? bookmarkOnIcon : bookmarkOffIcon}
              alt=""
              width={14}
              height={14}
              aria-hidden
            />
          </button>
        </div>

        {/* 중간: 카테고리 칩 */}
        <CategoryChip category={category} size="sm" className="self-start" />

        {/* 하단: 수집 상태 */}
        <div className="flex justify-end">{status && <StatusBadge status={status} />}</div>
      </div>
    </div>
  );
}
