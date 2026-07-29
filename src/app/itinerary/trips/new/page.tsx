"use client";

import Image from "next/image";
import travelImg from "@/assets/character/travel.png";
import { TripSetupForm } from "@/features/itinerary/components";
import { StaircaseGlassCard } from "@/components";

export default function TripNewPage() {
  return (
    <div className="flex h-full flex-col">
      {/* min-h-[170px](말풍선+문구가 겹치지 않을 최소 높이)+flex-1로 카드 바로 위까지
          늘어나서, 캐릭터가 항상 카드 상단에 붙어있게 한다. 폼 카드(TripSetupForm)는
          내용 높이 그대로고, 남는 공간은 전부 이 캐릭터 영역이 흡수한다. */}
      <div className="relative min-h-[170px] flex-1">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <StaircaseGlassCard line1="친구와 함께" line2="부산으로 떠나볼까요?" />
        </div>

        <p
          className="absolute left-[16px] top-[110px] font-dxsubtitles font-medium text-lg text-text-primary text-left"
          style={{ lineHeight: "23px" }}
        >
          멋진 추억을 만들 수 있게
          <br />
          부지런이 도와줄게요!
        </p>
        <div className="absolute right-[16px] bottom-[-12px] z-10">
          <Image src={travelImg} alt="" width={150} height={161} aria-hidden />
        </div>
      </div>

      {/* 여행 정보 입력 폼 */}
      <TripSetupForm />
    </div>
  );
}
