"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils";
import { CategoryChip } from "@/components";
import { VotePlaceCard } from "@/features/itinerary/components";
import infoIcon from "@/assets/icons/itinerary/info.png";
import flagIcon from "@/assets/icons/itinerary/flag.png";
import fromIcon from "@/assets/icons/itinerary/from.png";
import toIcon from "@/assets/icons/itinerary/to.png";
import freepassWhiteIcon from "@/assets/icons/itinerary/freepass-white.png";
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
  const [myVote, setMyVote] = useState<string | null>(null);

  const currentPlan = MOCK_PLANS.find((p) => p.id === activePlan) ?? MOCK_PLANS[0];
  const hasVoted = myVote !== null;

  const handleVote = () => {
    setMyVote(activePlan);
  };

  const handleFreepass = () => {
    router.push(`/itinerary?count=${count}`);
  };

  const handleVoteComplete = () => {
    router.push(`/itinerary?count=${count}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 공통 취향 glass 카드 */}
      <div className="shrink-0 pt-4 pb-3">
        <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[24px] py-[28px] backdrop-blur-[15px] flex flex-col items-start gap-4">
          <p className="font-ssurround font-bold text-lg text-text-heading">
            우리의 공통 취향은...
          </p>
          <div className="flex items-center gap-2">
            {COMMON_CATEGORIES.map((cat) => (
              <CategoryChip key={cat} category={cat} size="md" />
            ))}
          </div>
        </div>
      </div>

      {/* 투표 섹션 - PageCard 스타일 */}
      <div className="-mx-6 flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-8 pt-8 pb-4">
          {/* 헤더 */}
          <div className="flex items-center gap-1.5">
            <span className="font-ssurround font-bold text-lg text-text-heading">
              마음에 드는 일정에 투표해주세요!
            </span>
            <Image src={infoIcon} alt="안내" width={14} height={14} />
          </div>

          {/* 안 선택 탭 + 투표 수 */}
          <div className="mt-4 flex items-center gap-2">
            {MOCK_PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setActivePlan(plan.id)}
                className={cn(
                  "size-9 rounded-full font-ssurround font-bold text-lg flex items-center justify-center transition-colors",
                  activePlan === plan.id
                    ? "bg-main-blue text-white"
                    : "bg-sub-lightblue text-sub-deepblue",
                )}
              >
                {plan.id}
              </button>
            ))}
            <span className="ml-1 font-paperlogy text-sm text-text-secondary">
              {PLAN_LABELS[activePlan]}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <span className="font-paperlogy text-sm text-sub-deepblue">♥</span>
              <span className="font-paperlogy font-bold text-sm text-sub-deepblue">
                {currentPlan.voteCount + (myVote === activePlan ? 1 : 0)}
              </span>
            </div>
          </div>

          {/* 타임라인 */}
          <div className="relative mt-5 pl-5">
            {/* 세로 점선 */}
            <div className="absolute left-[8px] top-0 bottom-0 w-[1.5px] border-l-2 border-dashed border-sub-lightblue" />

            {/* 출발 */}
            <div className="relative mb-3 flex items-center gap-2">
              <div className="relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white">
                <Image src={fromIcon} alt="" width={14} height={14} aria-hidden />
              </div>
              <div className="rounded-[8px] bg-sub-lightblue px-2.5 py-1">
                <span className="font-paperlogy text-sm text-text-primary">10:00 여행 시작!</span>
              </div>
            </div>

            {/* 각 Day */}
            {currentPlan.days.map((day) => (
              <div key={day.day} className="mb-3">
                <div className="relative mb-2 flex items-center gap-2">
                  <div className="relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white">
                    <Image src={flagIcon} alt="" width={12} height={12} aria-hidden />
                  </div>
                  <span className="font-paperlogy font-bold text-sm text-text-heading">
                    {day.label}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 pl-7">
                  {day.places.map((place) => (
                    <div key={place.id} className="shrink-0">
                      <VotePlaceCard imageUrl={place.image} name={place.name} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 도착 */}
            <div className="relative flex items-center gap-2">
              <div className="relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white">
                <Image src={toIcon} alt="" width={14} height={14} aria-hidden />
              </div>
              <div className="rounded-[8px] bg-sub-lightblue px-2.5 py-1">
                <span className="font-paperlogy text-sm text-text-primary">15:00 여행 끝!</span>
              </div>
            </div>
          </div>

          {/* 투표 버튼 */}
          <button
            type="button"
            onClick={hasVoted ? handleVoteComplete : handleVote}
            className={cn(
              "mt-5 h-[42px] w-full rounded-[12px] font-ssurround font-bold text-lg transition-colors",
              hasVoted
                ? "bg-main-blue text-white"
                : "bg-sub-lightblue text-sub-deepblue opacity-50",
            )}
          >
            {hasVoted ? "투표 완료! 일정 보러가기 →" : "이 일정에 투표하기 ♥"}
          </button>
        </div>

        {/* 프리패스 버튼 (방장만 활성화) */}
        <div className="shrink-0 px-8 pb-6 pt-2">
          <button
            type="button"
            onClick={IS_HOST ? handleFreepass : undefined}
            disabled={!IS_HOST}
            className={cn(
              "flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] font-ssurround font-bold text-lg transition-opacity",
              IS_HOST
                ? "bg-text-heading text-white"
                : "bg-text-heading/30 text-white/50 cursor-not-allowed",
            )}
          >
            <Image src={freepassWhiteIcon} alt="" width={18} height={18} aria-hidden />
            <span>방장 마음대로 프리패스!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
