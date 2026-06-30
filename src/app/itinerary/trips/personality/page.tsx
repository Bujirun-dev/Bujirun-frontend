"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import faceImg from "@/assets/character/face.png";
import swipeRightIcon from "@/assets/icons/itinerary/swipe-right.png";
import swipeLeftIcon from "@/assets/icons/itinerary/swipe-left.png";
import { SpeechBubble } from "@/components";

const TOTAL_SLOTS = 6; // mock - 실제로는 searchParams 또는 API

function SmallAvatar() {
  return (
    <div className="relative size-[35px] overflow-hidden rounded-full bg-main-blue">
      <div className="relative size-[41px] -translate-x-[3px] -translate-y-[3px]">
        <Image src={faceImg} alt="" fill className="object-cover" aria-hidden />
      </div>
    </div>
  );
}

export default function TripPersonalityPage() {
  return (
    <Suspense fallback={null}>
      <TripPersonalityContent />
    </Suspense>
  );
}

function TripPersonalityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || TOTAL_SLOTS));

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-8">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[30px] py-[35px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 말풍선 */}
        <SpeechBubble variant="white" tailDirection="bottom" tailCenter>
          <span className="font-dxsubtitles text-md text-text-primary px-2 whitespace-nowrap">
            친구들이 모두 모였어요!
          </span>
        </SpeechBubble>

        {/* 친구 아바타 한 줄 */}
        <div className="mt-2 flex gap-1.5">
          {Array.from({ length: totalSlots }, (_, i) => (
            <SmallAvatar key={i} />
          ))}
        </div>

        {/* 타이틀 */}
        <p
          className="mt-5 font-ssurround font-bold text-xl text-black text-center"
          style={{ lineHeight: "30px" }}
        >
          그럼 이제부터
          <br />
          여행일정을 짜러 가볼까요?
        </p>

        {/* 안내 카드 */}
        <div className="mt-[20px] w-full rounded-[20px] border-[0.5px] border-main-blue bg-white px-4 py-5 flex flex-col items-center gap-2">
          <p className="font-paperlogy font-normal text-lg text-text-primary text-center">
            * 카드를 넘겨보면서
            <br />
            마음에 드는 장소를 골라주세요!
          </p>
          <div className="mt-1 flex flex-col items-start gap-1">
            <div className="flex items-center gap-[5px]">
              <Image src={swipeRightIcon} alt="" width={15} height={15} aria-hidden />
              <span className="font-paperlogy font-normal text-md text-text-primary">
                오른쪽: 좋아요
              </span>
            </div>
            <div className="flex items-center gap-[5px]">
              <Image src={swipeLeftIcon} alt="" width={15} height={15} aria-hidden />
              <span className="font-paperlogy font-normal text-md text-text-primary">
                왼쪽 : 별로에요
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-[24px] flex w-full gap-3">
          <button
            type="button"
            onClick={() => router.push("/itinerary")}
            className="flex-1 h-[40px] rounded-[10px] border border-main-blue bg-white font-ssurround font-bold text-sm text-sub-deepblue"
          >
            난 다 좋아!
          </button>
          <button
            type="button"
            onClick={() => router.push(`/itinerary/trips/swipe?count=${totalSlots}`)}
            className="flex-1 h-[40px] rounded-[10px] bg-main-blue font-ssurround font-bold text-sm text-white"
          >
            취향분석 할래!
          </button>
        </div>
      </div>
    </div>
  );
}
