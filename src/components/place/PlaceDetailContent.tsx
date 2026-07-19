"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { StaticImageData } from "next/image";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.png";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.png";
import callIcon from "@/assets/icons/itinerary/call.png";
import clockIcon from "@/assets/icons/itinerary/clock-blue.png";
import feeIcon from "@/assets/icons/itinerary/fee.png";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import markerPinkIcon from "@/assets/icons/itinerary/marker-pink.png";
import parkingIcon from "@/assets/icons/itinerary/parking.png";
import { BackButton, Card, CategoryChip } from "@/components";
import type { Category } from "@/components";
import { cn } from "@/shared/utils";

type InfoIconType = "clock" | "fee" | "parking" | "call";
type PlaceDetailSize = "default" | "compact";

const INFO_ICONS: Record<InfoIconType, StaticImageData> = {
  clock: clockIcon,
  fee: feeIcon,
  parking: parkingIcon,
  call: callIcon,
};

export interface PlaceDetailInfoItem {
  type: InfoIconType;
  label: string;
  value: string;
}

export interface PlaceDetailRelatedLog {
  id: string;
  imageUrl: string;
  author: string;
}

export interface PlaceDetailData {
  imageUrl: string | StaticImageData;
  name: string;
  category: Category;
  description: string;
  address: string;
  mapUrl?: string;
  isBookmarked?: boolean;
  infoItems?: PlaceDetailInfoItem[];
}

interface PlaceDetailContentProps {
  place: PlaceDetailData;
  onBookmark?: () => void;
  relatedLogs?: PlaceDetailRelatedLog[];
  onViewMoreLogs?: () => void;
  relatedLogsHref?: string;
  onLogClick?: (logId: string) => void;
  getRelatedLogHref?: (logId: string) => string;
  imageOverlay?: ReactNode;
  footer?: ReactNode;
  // 일정 탭의 작은 타임라인 팝업처럼 좁은 공간에 넣을 땐 "compact"로 축소한다. 기본은 "default".
  size?: PlaceDetailSize;
  // 있으면 이미지까지 포함해서 화면 전체가 한 번에 스크롤되고, 스크롤 시 뒤로가기
  // 버튼 옆에 관광지명이 떠오르는 sticky 헤더로 바뀐다. 없으면 기존처럼 이미지/이름은
  // 고정, 아래 섹션만 스크롤.
  onBack?: () => void;
}

export function PlaceDetailContent({
  place,
  onBookmark,
  relatedLogs,
  onViewMoreLogs,
  relatedLogsHref,
  onLogClick,
  getRelatedLogHref,
  imageOverlay,
  footer,
  size = "default",
  onBack,
}: PlaceDetailContentProps) {
  const { imageUrl, name, category, description, address, mapUrl, isBookmarked, infoItems } = place;
  const compact = size === "compact";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nameRowRef = useRef<HTMLDivElement>(null);
  const [showStickyName, setShowStickyName] = useState(false);
  const headerHeight = compact ? 36 : 44;

  // scrollTop/offsetTop 계산은 padding·offsetParent에 따라 어긋나기 쉬워서,
  // sticky 헤더 높이만큼 root를 줄인 IntersectionObserver로 "이름 줄이 헤더 밑으로
  // 넘어갔는지"를 직접 관찰한다.
  useEffect(() => {
    if (!onBack) return;
    const root = scrollContainerRef.current;
    const target = nameRowRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyName(!entry.isIntersecting),
      { root, rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [onBack, headerHeight]);

  const nameRow = (
    <div
      ref={nameRowRef}
      className={cn(
        "shrink-0 flex items-center justify-between",
        compact ? "pt-3 pb-2.5" : "pt-5 pb-4",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Image
          src={markerPinkIcon}
          alt=""
          width={compact ? 12 : 18}
          height={compact ? 12 : 18}
          aria-hidden
        />
        <span
          className={cn(
            "truncate font-bold text-text-heading tracking-[-0.3px]",
            compact ? "text-md" : "text-xl",
          )}
        >
          {name}
        </span>
        <CategoryChip category={category} size={compact ? "sm" : "md"} className="ml-2 shrink-0" />
      </div>
      {onBookmark !== undefined && (
        <button
          type="button"
          aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          onClick={onBookmark}
          className="ml-2 shrink-0 active:opacity-70"
        >
          <Image
            src={isBookmarked ? bookmarkOnIcon : bookmarkOffIcon}
            alt=""
            width={compact ? 12 : 18}
            height={compact ? 12 : 18}
            aria-hidden
          />
        </button>
      )}
    </div>
  );

  const sections = (
    <div
      className={cn(
        "overflow-x-hidden flex flex-col",
        onBack ? "" : "flex-1 overflow-y-auto",
        compact ? "gap-3 py-3" : "gap-5 py-5",
      )}
    >
      {/* 소개 */}
      <section className="flex flex-col gap-2">
        <h2 className={cn("font-bold text-text-heading", compact ? "text-xs" : "text-lg")}>소개</h2>
        <p
          className={cn(
            "leading-relaxed text-text-primary",
            compact ? "text-xs font-normal" : "text-md",
          )}
        >
          {description?.trim() || "등록된 내용이 없습니다."}
        </p>
      </section>

      <hr className="border-[0.3px] border-sub-lightgray" />

      {/* 위치 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className={cn("font-bold text-text-heading", compact ? "text-xs" : "text-lg")}>
            위치
          </h2>
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noreferrer" className="active:opacity-70">
              <Image
                src={kakaoMapIcon}
                alt="카카오맵"
                width={compact ? 37 : 45}
                height={compact ? 11 : 17}
                className="object-contain"
              />
            </a>
          )}
        </div>
        <p className={cn("text-text-primary", compact ? "text-xs font-normal" : "text-md")}>
          {address}
        </p>
      </section>

      {infoItems && infoItems.length > 0 && (
        <>
          <hr className="border-[0.3px] border-sub-lightgray" />
          <section className="flex flex-col gap-2">
            <h2 className={cn("font-bold text-text-heading", compact ? "text-xs" : "text-lg")}>
              정보
            </h2>
            <Card
              variant="glass-sm"
              className={cn("flex flex-col gap-2", compact ? "!p-[10px_12px]" : "!p-[12px_16px]")}
            >
              {infoItems.map((item) => (
                <InfoRow
                  key={item.label}
                  icon={INFO_ICONS[item.type]}
                  label={item.label}
                  value={item.value}
                  compact={compact}
                />
              ))}
            </Card>
          </section>
        </>
      )}

      {relatedLogs !== undefined && (
        <>
          <hr className="border-[0.3px] border-sub-lightgray" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className={cn("font-bold text-text-heading", compact ? "text-xs" : "text-lg")}>
                관련 로그
              </h2>
              {relatedLogsHref ? (
                <Link href={relatedLogsHref} className="flex items-center gap-1 active:opacity-70">
                  <span className="text-xs font-semibold text-sub-gray">더보기</span>
                  <span className="text-xs text-sub-gray">›</span>
                </Link>
              ) : (
                onViewMoreLogs && (
                  <button
                    type="button"
                    className="flex items-center gap-1 active:opacity-70"
                    onClick={onViewMoreLogs}
                  >
                    <span className="text-xs font-semibold text-sub-gray">더보기</span>
                    <span className="text-xs text-sub-gray">›</span>
                  </button>
                )
              )}
            </div>
            <div className={cn("flex", compact ? "gap-3 overflow-x-auto pb-1" : "gap-4")}>
              {relatedLogs.length === 0 ? (
                <p className="text-sm text-sub-gray">아직 관련 로그가 없어요</p>
              ) : (
                relatedLogs.slice(0, compact ? 4 : 2).map((log) => {
                  const content = (
                    <>
                      <Image src={log.imageUrl} alt="" fill className="object-cover" />
                      <div className="absolute bottom-[6px] left-[6px] rounded-[5px] bg-system-blackbg px-1.5 py-0.5">
                        <span className="text-2xs font-medium text-white">{log.author}</span>
                      </div>
                    </>
                  );
                  const className = cn(
                    "relative shrink-0 overflow-hidden rounded-lg active:opacity-70",
                    compact ? "h-[67px] w-[106px]" : "h-[95px] w-[150px]",
                  );

                  if (getRelatedLogHref) {
                    return (
                      <Link key={log.id} href={getRelatedLogHref(log.id)} className={className}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => onLogClick?.(log.id)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );

  const image = (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden",
        compact ? "h-[145px] rounded-[10px]" : "h-[210px] rounded-[15px]",
      )}
    >
      <Image src={imageUrl} alt={name} fill className="object-cover" />
      {imageOverlay}
    </div>
  );

  if (onBack) {
    return (
      <div className="relative flex h-full flex-col">
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-20 flex shrink-0 items-center gap-3 bg-main-white",
            compact ? "h-9" : "h-11",
          )}
        >
          <BackButton className="bg-transparent" onClick={onBack} />
          <span
            className={cn(
              "truncate font-bold text-text-heading transition-opacity duration-200",
              compact ? "text-md" : "text-xl",
              showStickyName ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {name}
          </span>
        </div>
        <div
          ref={scrollContainerRef}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
            compact ? "pt-9" : "pt-11",
          )}
        >
          {image}
          {nameRow}
          <hr className="border-[0.3px] border-sub-lightgray" />
          {sections}
        </div>
        {footer && <div className="shrink-0 px-1 pb-6 pt-3">{footer}</div>}
      </div>
    );
  }

  return (
    <>
      {image}
      {nameRow}
      <hr className="shrink-0 border-[0.3px] border-sub-lightgray" />
      {sections}
      {footer && (
        <div className={cn("shrink-0", compact ? "pb-0 pt-2" : "pb-6 pt-3")}>{footer}</div>
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  compact,
}: {
  icon: StaticImageData;
  label: string;
  value: string;
  compact: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[5px] border-[0.1px] border-main-blue bg-system-navbg",
          compact ? "h-[22px] w-[22px]" : "h-[26px] w-[26px]",
        )}
      >
        <Image src={icon} alt="" width={compact ? 12 : 14} height={compact ? 12 : 14} aria-hidden />
      </div>

      <p
        className={cn("shrink-0 font-semibold text-text-primary", compact ? "text-xs" : "text-md")}
      >
        {label}
      </p>
      <p
        className={cn(
          "min-w-0 flex-1 break-keep whitespace-pre-line text-right text-text-primary",
          compact ? "text-2xs" : "text-sm",
        )}
      >
        {value.replace(/<br\s*\/?>\s*/gi, "\n")}
      </p>
    </div>
  );
}
