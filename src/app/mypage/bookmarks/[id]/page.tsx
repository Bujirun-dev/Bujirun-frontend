"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { BackButton, CategoryChip, PageCard, Card } from "@/components";
import bookmarkOnIcon from "@/assets/icons/mypage/bookmark-on.png";
import bookmarkOffIcon from "@/assets/icons/mypage/bookmark-off.png";
import kakaoMapIcon from "@/assets/icons/itinerary/kakaomap_horizontal_ko.png";
import markerPinkIcon from "@/assets/icons/itinerary/marker-pink.png";
import clockIcon from "@/assets/icons/itinerary/clock-blue.png";
import feeIcon from "@/assets/icons/itinerary/fee.png";
import parkingIcon from "@/assets/icons/itinerary/parking.png";
import callIcon from "@/assets/icons/itinerary/call.png";
import type { Category } from "@/components";
import { PLACES } from "@/features/collection/data/places";

// TODO: API 연결 시 useQuery로 교체
const MOCK_PLACE = {
  id: "1",
  name: "송도 해수욕장",
  category: "sea" as Category,
  description:
    "부산의 대표적인 해수욕장 중 하나로, 아름다운 백사장과 맑은 바다가 펼쳐지는 곳입니다. 케이블카와 다양한 해양 액티비티를 즐길 수 있으며, 주변에 맛집과 카페가 즐비합니다.",
  address: "부산 서구 송도해변로 100 일대 (암남동)",
  hours: "09:00 - 18:00",
  fee: "무료",
  parking: "공영 주차장",
  phone: "051-240-4000",
  isBookmarked: true,
  relatedLogs: [
    { id: "1", imageUrl: "https://picsum.photos/seed/log1/150/95", author: "은지미" },
    { id: "2", imageUrl: "https://picsum.photos/seed/log2/150/95", author: "비니" },
  ],
};

export default function BookmarkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // TODO: API 연결 시 id로 관광지 상세 fetch
  // PLACES에서 id로 관광지 이름, 카테고리만 가져옴
  const placeInfo = PLACES.find((p) => p.id === Number(id));
  const place = {
    ...MOCK_PLACE,
    name: placeInfo?.name ?? MOCK_PLACE.name,
    category: (placeInfo?.category ?? MOCK_PLACE.category) as Category,
  };

  const [isBookmarked, setIsBookmarked] = useState(place.isBookmarked);

  return (
    <PageCard className="px-0 pt-0">
      {/* 타이틀 + 뒤로가기 - 이미지 위 별도 영역 */}
      <div className="flex items-center gap-3  py-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">북마크 목록</h1>
      </div>

      {/* 스크롤 영역 - 이미지 포함 */}
      <div className="flex-1 overflow-y-auto">
        {/* 대표 이미지 - TODO: API 연결 시 place.imageUrl로 교체 */}
        <div className="relative w-full h-[211px] shrink-0">
          <Image
            src={`https://picsum.photos/seed/${id}/400/300`}
            alt={place.name}
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        {/* 상세 정보 */}
        <div className="px-2 py-4 flex flex-col gap-4">
          {/* 관광지명 + 카테고리칩 + 북마크 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Image src={markerPinkIcon} alt="" width={16} height={16} aria-hidden />
              <span className="text-lg font-medium text-text-heading tracking-[-0.3px]">
                {place.name}
              </span>
              <CategoryChip category={place.category} size="sm" />
            </div>
            <button
              type="button"
              aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
              onClick={() => {
                setIsBookmarked((prev) => !prev);
                // TODO: 북마크 on/off API 연결
              }}
              className="shrink-0 active:opacity-70"
            >
              <Image
                src={isBookmarked ? bookmarkOnIcon : bookmarkOffIcon}
                alt=""
                width={16}
                height={16}
                aria-hidden
              />
            </button>
          </div>

          <hr className="w-[316px] border-[0.3px] border-sub-lightgray" />

          {/* 소개 */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-ssurround font-bold text-sm text-text-heading">소개</h2>
            <p className="text-xs text-text-primary leading-[2.5]">{place.description}</p>
          </div>

          <hr className="w-[316px] border-[0.3px] border-sub-lightgray" />

          {/* 위치 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="font-ssurround font-bold text-sm text-text-heading">위치</h2>
              <button className="active:opacity-70">
                <Image
                  src={kakaoMapIcon}
                  alt="카카오맵"
                  width={45}
                  height={17}
                  className="object-contain"
                />
              </button>
            </div>
            <p className="text-xs text-text-primary">{place.address}</p>
          </div>

          <hr className="w-[316px] border-[0.3px] border-sub-lightgray" />

          {/* 정보 + 문의 */}
          <div className="flex flex-col gap-2">
            <h2 className="font-ssurround font-bold text-sm text-text-heading">정보</h2>
            <Card variant="glass-sm" className="w-[316px] flex flex-col gap-2 !p-[12px_19px]">
              <InfoRow icon={clockIcon} label="운영시간" value={place.hours} />
              <InfoRow icon={feeIcon} label="입장료" value={place.fee} />
              <InfoRow icon={parkingIcon} label="주차" value={place.parking} />
              <InfoRow icon={callIcon} label="문의" value={place.phone} />
            </Card>
          </div>

          <hr className="w-[316px] border-[0.3px] border-sub-lightgray" />

          {/* 관련 로그 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-ssurround font-bold text-sm text-text-heading">관련 로그</h2>
              <button
                className="flex items-center gap-1 active:opacity-70"
                onClick={() => {
                  // TODO: 관련 로그 더보기 페이지 이동
                }}
              >
                <span className="text-3xs font-semibold text-sub-gray">더보기</span>
                <span className="text-3xs text-sub-gray">›</span>
              </button>
            </div>
            <div className="flex gap-4">
              {place.relatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="relative w-[150px] h-[95px] rounded-lg overflow-hidden shrink-0"
                >
                  <Image src={log.imageUrl} alt="" fill className="object-cover" />
                  <div className="absolute bottom-[6px] left-[6px] bg-system-blackbg rounded-[5px] px-1.5 py-0.5">
                    <span className="text-3xs font-medium text-white">{log.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageCard>
  );
}

// 정보 행 공통 컴포넌트
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: StaticImageData | string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-[5px] bg-system-navbg border-[0.1px] border-main-blue flex items-center justify-center shrink-0">
          <Image src={icon} alt="" width={12} height={12} aria-hidden />
        </div>
        <span className="text-xs text-text-primary">{label}</span>
      </div>
      <span className="text-xs text-text-primary">{value}</span>
    </div>
  );
}
