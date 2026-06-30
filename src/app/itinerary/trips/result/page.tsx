"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils";
import { CategoryChip } from "@/components";
import infoIcon from "@/assets/icons/itinerary/info.png";
import freepassWhiteIcon from "@/assets/icons/itinerary/freepass-white.png";
import flagImg from "@/assets/place/flag.png";
import houseImg from "@/assets/place/house.png";
import busanStationImg from "@/assets/place/busan-station.png";
import type { Category } from "@/components/ui/CategoryChip";

// TODO: API 연동 후 실제 데이터로 교체
const COMMON_CATEGORIES: Category[] = ["sea", "culture", "nature"];

const PLAN_LABELS: Record<string, string> = {
  A: "취향 집중형",
  B: "균형 최적형",
  C: "자유 편집형",
};

type Place = { id: number; name: string; image: string };
type Day = { day: number; label: string; places: Place[] };
type Plan = { id: string; days: Day[]; voteCount: number };

const MOCK_PLANS: Plan[] = [
  {
    id: "A",
    voteCount: 3,
    days: [
      {
        day: 1,
        label: "Day 1",
        places: [
          { id: 1, name: "광안리 해수욕장", image: "https://picsum.photos/seed/place1/200/200" },
          { id: 2, name: "해운대 해수욕장", image: "https://picsum.photos/seed/place2/200/200" },
          { id: 3, name: "동백섬", image: "https://picsum.photos/seed/place3/200/200" },
        ],
      },
      {
        day: 2,
        label: "Day 2",
        places: [
          { id: 4, name: "감천 문화마을", image: "https://picsum.photos/seed/place4/200/200" },
          { id: 5, name: "국제시장", image: "https://picsum.photos/seed/place5/200/200" },
        ],
      },
      {
        day: 3,
        label: "Day 3",
        places: [
          { id: 6, name: "태종대", image: "https://picsum.photos/seed/place6/200/200" },
          { id: 7, name: "영도대교", image: "https://picsum.photos/seed/place7/200/200" },
          { id: 8, name: "송도 해수욕장", image: "https://picsum.photos/seed/place8/200/200" },
        ],
      },
    ],
  },
  {
    id: "B",
    voteCount: 1,
    days: [
      {
        day: 1,
        label: "Day 1",
        places: [
          { id: 9, name: "용두산공원", image: "https://picsum.photos/seed/place9/200/200" },
          { id: 10, name: "BIFF 광장", image: "https://picsum.photos/seed/place10/200/200" },
        ],
      },
      {
        day: 2,
        label: "Day 2",
        places: [
          { id: 11, name: "흰여울 문화마을", image: "https://picsum.photos/seed/place11/200/200" },
          { id: 12, name: "절영해안산책로", image: "https://picsum.photos/seed/place12/200/200" },
          { id: 13, name: "영도등대", image: "https://picsum.photos/seed/place13/200/200" },
        ],
      },
      {
        day: 3,
        label: "Day 3",
        places: [
          { id: 14, name: "기장 해안도로", image: "https://picsum.photos/seed/place14/200/200" },
          { id: 15, name: "일광 해수욕장", image: "https://picsum.photos/seed/place15/200/200" },
        ],
      },
    ],
  },
  {
    id: "C",
    voteCount: 0,
    days: [
      {
        day: 1,
        label: "Day 1",
        places: [
          { id: 16, name: "부산시립미술관", image: "https://picsum.photos/seed/place16/200/200" },
          { id: 17, name: "F1963", image: "https://picsum.photos/seed/place17/200/200" },
        ],
      },
      {
        day: 2,
        label: "Day 2",
        places: [
          { id: 18, name: "부산박물관", image: "https://picsum.photos/seed/place18/200/200" },
          { id: 19, name: "임시수도기념관", image: "https://picsum.photos/seed/place19/200/200" },
          { id: 20, name: "UN기념공원", image: "https://picsum.photos/seed/place20/200/200" },
        ],
      },
      {
        day: 3,
        label: "Day 3",
        places: [
          { id: 21, name: "어린이대공원", image: "https://picsum.photos/seed/place21/200/200" },
          { id: 22, name: "금강공원", image: "https://picsum.photos/seed/place22/200/200" },
        ],
      },
    ],
  },
];

// TODO: API 연동 후 실제 방장 여부로 교체
const IS_HOST = true;

function TimelineSpeechBubble({ children }: { children: string }) {
  return (
    <div className="relative h-[25px] w-[112px]">
      <span className="absolute left-[-2px] top-1/2 z-0 h-[11px] w-[11px] -translate-y-1/2 rotate-45 rounded-[1.5px] border border-main-blue bg-main-white" />
      <div className="relative z-10 box-border flex h-full w-full items-center justify-center rounded-[10px] border border-main-blue bg-main-white px-[12px] py-[6px]">
        <span className="font-paperlogy text-[11px] font-medium leading-none text-sub-deepblue">
          {children}
        </span>
      </div>
      <span className="absolute left-[-1px] top-1/2 z-20 h-[17px] w-[11px] -translate-y-1/2 bg-main-white" />
      <span className="absolute left-0 top-[6px] z-30 h-[1px] w-[2px] bg-main-blue" />
      <span className="absolute left-0 bottom-[6px] z-30 h-[1px] w-[2px] bg-main-blue" />
    </div>
  );
}

function ResultPlaceNode({ place }: { place: Place }) {
  return (
    <div className="relative flex min-w-0 flex-col items-center">
      <p className="absolute left-1/2 -top-[34px] max-w-[78px] -translate-x-1/2 truncate whitespace-nowrap text-center font-paperlogy text-[11px] font-normal text-text-heading">
        {place.name}
      </p>
      <span className="absolute left-1/2 -top-[13px] z-10 size-[11px] -translate-x-1/2 rounded-full border-[1.5px] border-main-blue bg-main-white" />
      <div className="relative h-[35px] w-[53px] overflow-hidden rounded-[8px] border border-main-blue bg-system-navbg">
        <Image src={place.image} alt={place.name} fill className="object-cover" />
      </div>
    </div>
  );
}

export default function TripResultPage() {
  return (
    <Suspense fallback={null}>
      <TripResultContent />
    </Suspense>
  );
}

function TripResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = searchParams.get("count") ?? "6";

  const [activePlan, setActivePlan] = useState<string>("A");
  const currentPlan = MOCK_PLANS.find((p) => p.id === activePlan) ?? MOCK_PLANS[0];

  const handleFreepass = () => {
    router.push(`/itinerary?count=${count}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 공통 취향 glass 카드 */}
      <div className="shrink-0 pt-4 pb-[30px]">
        <div className="w-full rounded-[20px] border border-system-navbg bg-gradient-to-b from-system-glassfrom to-system-glassto px-[24px] py-[28px] backdrop-blur-[15px] flex flex-col items-center gap-2.5">
          <p className="font-ssurround font-bold text-lg text-text-heading text-center">
            우리의 공통 취향은...
          </p>
          <div className="flex items-center gap-2">
            {COMMON_CATEGORIES.map((cat) => (
              <CategoryChip key={cat} category={cat} size="lg" />
            ))}
          </div>
        </div>
      </div>

      {/* 투표 섹션 - PageCard 스타일 */}
      <div className="-mx-6 flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-[28px] pt-[28px] pb-[10px]">
          {/* 헤더 */}
          <div className="flex items-center gap-1.5">
            <span className="font-ssurround font-bold text-lg text-text-heading">
              마음에 드는 일정에 투표해주세요!
            </span>
            <Image src={infoIcon} alt="안내" width={14} height={14} />
          </div>

          {/* 글래스 카드 - 투표 정보 */}
          <div className="-mx-[4px] mt-4 flex flex-col rounded-[20px] border border-system-navbg bg-gradient-to-b from-system-glassfrom to-system-glassto px-[16px] pt-[20px] pb-[24px] backdrop-blur-[15px]">
            {/* 안 선택 탭 + 투표 수 */}
            <div className="flex items-center gap-[5px]">
              {MOCK_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  aria-label={`${PLAN_LABELS[plan.id]} ${plan.id}안`}
                  onClick={() => setActivePlan(plan.id)}
                  className={cn(
                    "rounded-[10px] px-[12px] pt-[4px] pb-[2px] font-proup text-md text-main-white flex items-center justify-center transition-colors",
                    activePlan === plan.id ? "bg-main-blue" : "bg-sub-lightblue",
                  )}
                >
                  {plan.id}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1">
                <span className="font-paperlogy text-sm text-sub-deepblue">♥</span>
                <span className="font-paperlogy font-bold text-sm text-sub-deepblue">
                  {currentPlan.voteCount}
                </span>
              </div>
            </div>

            {/* 타임라인 */}
            <div className="relative mt-5 ml-0">
              {/* 세로 점선 - 이미지 중심(22px) 기준 */}
              <div className="absolute left-[22px] top-[22px] bottom-[22px] w-[2px] bg-[repeating-linear-gradient(to_bottom,#4da6ff_0,#4da6ff_6px,transparent_6px,transparent_12px)]" />

              {/* 출발 - 부산역 */}
              <div className="relative flex items-center gap-5">
                <div className="relative z-10 flex h-[49px] w-[45px] shrink-0 items-center justify-center">
                  <div className="absolute inset-[-6px] rounded-full bg-[rgba(151,193,255,0.3)] blur-md" />
                  <Image
                    src={busanStationImg}
                    alt=""
                    width={45}
                    height={45}
                    aria-hidden
                    className="relative z-10"
                  />
                </div>
                <TimelineSpeechBubble>10:00 여행 시작!</TimelineSpeechBubble>
              </div>

              {/* 각 Day */}
              <div className="mt-[12px] flex flex-col gap-[45px]">
                {currentPlan.days.map((day) => (
                  <div key={day.day}>
                    <div className="relative flex items-center gap-[2px]">
                      <div className="relative z-10 h-[25px] w-[35px] shrink-0">
                        <span className="absolute left-[9.5px] top-1/2 z-0 h-[29px] w-[25px] -translate-y-1/2 rounded-full bg-main-white" />
                        <div className="absolute left-[5.5px] top-1/2 z-10 h-[33px] w-[33px] -translate-y-1/2 rounded-full bg-sub-pink/30 blur-md" />
                        <Image
                          src={flagImg}
                          alt=""
                          width={25}
                          height={25}
                          aria-hidden
                          className="absolute left-[9.5px] top-0 z-20"
                        />
                      </div>
                      <span className="font-paperlogy text-xs font-medium text-sub-deepblue">
                        {day.label.toLowerCase()}
                      </span>
                      <div className="relative ml-[3px] h-[1.5px] w-[235px] rounded-full bg-main-blue">
                        <div className="absolute left-0 right-0 top-[7.5px] flex items-start justify-around">
                          {day.places.map((place) => (
                            <ResultPlaceNode key={place.id} place={place} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 도착 - 집 */}
              <div className="relative mt-[44px] flex items-center gap-5">
                <div className="relative z-10 flex h-[49px] w-[45px] shrink-0 items-center justify-center">
                  <div className="absolute inset-[-6px] rounded-full bg-[rgba(151,193,255,0.3)] blur-md" />
                  <Image
                    src={houseImg}
                    alt=""
                    width={45}
                    height={45}
                    aria-hidden
                    className="relative z-10"
                  />
                </div>
                <TimelineSpeechBubble>15:00 여행 끝!</TimelineSpeechBubble>
              </div>
            </div>
          </div>

          {/* 프리패스 버튼 (방장만 활성화) */}
          <button
            type="button"
            onClick={IS_HOST ? handleFreepass : undefined}
            disabled={!IS_HOST}
            className={cn(
              "mt-[24px] flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] font-ssurround font-bold text-md text-main-white transition-opacity",
              IS_HOST ? "bg-main-blue" : "bg-sub-gray cursor-not-allowed",
            )}
          >
            <Image
              src={freepassWhiteIcon}
              alt=""
              width={15}
              height={15}
              aria-hidden
              className="-translate-y-0.5"
            />
            <span>방장 마음대로 프리패스!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
