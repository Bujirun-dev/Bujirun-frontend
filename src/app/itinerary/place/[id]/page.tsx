"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AngleLeftIcon from "@/assets/icons/itinerary/angle-left.svg";
import BookmarkOffIcon from "@/assets/icons/itinerary/bookmark-off.svg";
import BookmarkOnIcon from "@/assets/icons/itinerary/bookmark-on.svg";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import CallIcon from "@/assets/icons/itinerary/call.svg";
import { Button, CategoryChip, PageCard } from "@/components";

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <PageCard className="px-0">
      {/* 대표 이미지 */}
      <div className="relative w-full h-[220px] shrink-0">
        <Image
          src={`https://picsum.photos/seed/${id}/400/300`}
          alt="관광지"
          fill
          className="object-cover"
        />
        {/* 상단 버튼 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="size-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <AngleLeftIcon width={16} height={16} aria-hidden />
          </button>
          <button
            onClick={() => setBookmarked((b) => !b)}
            className="size-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            {bookmarked
              ? <BookmarkOnIcon width={18} height={18} aria-label="북마크 해제" />
              : <BookmarkOffIcon width={18} height={18} aria-label="북마크" />
            }
          </button>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 flex flex-col gap-4">
        {/* 이름 + 카테고리 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-text-heading">해운대 해수욕장</h1>
          </div>
          <CategoryChip category="sea" />
        </div>

        {/* 소개 */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-md text-text-heading">소개</h2>
          <p className="text-sm text-text-primary leading-relaxed">
            해운대 해수욕장은 부산광역시 해운대구에 위치한 대한민국 최대 규모의 해수욕장입니다.
            아름다운 백사장과 맑은 바닷물로 매년 수백만 명의 관광객이 방문합니다.
          </p>
        </div>

        {/* 위치 */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-md text-text-heading">위치</h2>
          <div className="flex items-start gap-2">
            <MarkerIcon width={14} height={14} className="mt-0.5 shrink-0" aria-hidden />
            <span className="text-sm text-text-primary">
              부산광역시 해운대구 우동 해운대해변로 264
            </span>
          </div>
          <button className="self-start mt-1">
            <Image
              src={kakaoMapIcon}
              alt="카카오맵"
              width={120}
              height={30}
              className="object-contain"
            />
          </button>
        </div>

        {/* 정보 */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-md text-text-heading">정보</h2>
          <div className="flex items-center gap-2">
            <CallIcon width={14} height={14} aria-hidden />
            <span className="text-sm text-text-primary">051-749-7601</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-6 pt-3">
        <Button variant="primary" onClick={() => router.back()}>
          + 일정에 추가
        </Button>
      </div>
    </PageCard>
  );
}
