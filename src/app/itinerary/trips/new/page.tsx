"use client";

import Image from "next/image";
import travelImg from "@/assets/character/travel.png";
import { TripSetupForm, StaircaseGlassCard } from "@/features/itinerary/components";

export default function TripNewPage() {
  return (
    <div className="flex flex-col h-full">
      {/* 캐릭터 영역 */}
      <div className="flex-1 relative flex flex-col justify-between pt-2 pb-4">
        <div className="absolute left-1/2 -translate-x-1/2 top-[43px]">
          <StaircaseGlassCard line1="친구와 함께" line2="부산으로 떠나볼까요?" />
        </div>

        <p className="absolute left-[16px] top-[155px] font-dxsubtitles font-medium text-lg text-text-primary text-left" style={{ lineHeight: "23px" }}>
          멋진 추억을 만들 수 있게
          <br />
          부지런이 도와줄게요!
        </p>
        <div className="absolute right-[-16px] bottom-[-50px] z-10">
          <Image src={travelImg} alt="" width={240} height={257} aria-hidden />
        </div>
      </div>

      {/* 여행 정보 입력 폼 */}
      <TripSetupForm />
    </div>
  );
}
