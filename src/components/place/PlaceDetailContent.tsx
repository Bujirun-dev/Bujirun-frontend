"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import bookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.png";
import bookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.png";
import callIcon from "@/assets/icons/itinerary/call.png";
import clockIcon from "@/assets/icons/itinerary/clock-blue.png";
import feeIcon from "@/assets/icons/itinerary/fee.png";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import markerPinkIcon from "@/assets/icons/itinerary/marker-pink.png";
import parkingIcon from "@/assets/icons/itinerary/parking.png";
import { Card, CategoryChip } from "@/components";
import type { Category } from "@/components";

type InfoIconType = "clock" | "fee" | "parking" | "call";

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
  imageUrl: string;
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
}: PlaceDetailContentProps) {
  const { imageUrl, name, category, description, address, mapUrl, isBookmarked, infoItems } = place;

  return (
    <>
      {/* 이미지 */}
      <div className="relative h-[210px] w-full shrink-0 overflow-hidden rounded-[15px]">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
        {imageOverlay}
      </div>

      {/* 관광지명 + 카테고리 + 북마크 — 고정 */}
      <div className="shrink-0 flex items-center justify-between pt-5 pb-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <Image src={markerPinkIcon} alt="" width={18} height={18} aria-hidden />
          <span className="truncate text-xl font-medium text-text-heading tracking-[-0.3px]">
            {name}
          </span>
          <CategoryChip category={category} size="md" className="ml-2 shrink-0" />
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
              width={20}
              height={20}
              aria-hidden
            />
          </button>
        )}
      </div>

      <hr className="shrink-0 border-[0.3px] border-sub-lightgray" />

      {/* 스크롤 콘텐츠 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-5 flex flex-col gap-5">
        {/* 소개 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-md font-bold text-text-heading">소개</h2>
          <p className="text-sm leading-relaxed text-text-primary">{description}</p>
        </section>

        <hr className="border-[0.3px] border-sub-lightgray" />

        {/* 위치 */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-bold text-text-heading">위치</h2>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noreferrer" className="active:opacity-70">
                <Image
                  src={kakaoMapIcon}
                  alt="카카오맵"
                  width={45}
                  height={17}
                  className="object-contain"
                />
              </a>
            )}
          </div>
          <p className="text-sm text-text-primary">{address}</p>
        </section>

        {infoItems && infoItems.length > 0 && (
          <>
            <hr className="border-[0.3px] border-sub-lightgray" />
            <section className="flex flex-col gap-2">
              <h2 className="text-md font-bold text-text-heading">정보</h2>
              <Card variant="glass-sm" className="flex flex-col gap-2 !p-[12px_19px]">
                {infoItems.map((item) => (
                  <InfoRow
                    key={item.label}
                    icon={INFO_ICONS[item.type]}
                    label={item.label}
                    value={item.value}
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
                <h2 className="text-md font-bold text-text-heading">관련 로그</h2>
                {relatedLogs.length > 0 &&
                  (relatedLogsHref ? (
                    <Link
                      href={relatedLogsHref}
                      className="flex items-center gap-1 active:opacity-70"
                    >
                      <span className="text-2xs font-semibold text-sub-gray">더보기</span>
                      <span className="text-2xs text-sub-gray">›</span>
                    </Link>
                  ) : (
                    onViewMoreLogs && (
                      <button
                        type="button"
                        className="flex items-center gap-1 active:opacity-70"
                        onClick={onViewMoreLogs}
                      >
                        <span className="text-2xs font-semibold text-sub-gray">더보기</span>
                        <span className="text-2xs text-sub-gray">›</span>
                      </button>
                    )
                  ))}
              </div>
              <div className="flex gap-4">
                {relatedLogs.length === 0 ? (
                  <p className="text-sm text-sub-gray">아직 관련 로그가 없어요</p>
                ) : (
                  relatedLogs.slice(0, 2).map((log) => {
                    const content = (
                      <>
                        <Image src={log.imageUrl} alt="" fill className="object-cover" />
                        <div className="absolute bottom-[6px] left-[6px] rounded-[5px] bg-system-blackbg px-1.5 py-0.5">
                          <span className="text-2xs font-medium text-white">{log.author}</span>
                        </div>
                      </>
                    );
                    const className =
                      "relative h-[95px] w-[150px] shrink-0 overflow-hidden rounded-lg active:opacity-70";

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

      {footer && <div className="shrink-0 pb-6 pt-3">{footer}</div>}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: StaticImageData; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[5px] border-[0.1px] border-main-blue bg-system-navbg">
          <Image src={icon} alt="" width={14} height={14} aria-hidden />
        </div>
        <span className="text-sm text-text-primary">{label}</span>
      </div>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}
