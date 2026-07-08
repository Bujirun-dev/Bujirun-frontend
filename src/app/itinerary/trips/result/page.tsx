"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils";
import { CategoryChip, Modal, SpeechBubble, Toast } from "@/components";
import checkIcon from "@/assets/icons/itinerary/check.png";
import infoIcon from "@/assets/icons/itinerary/info.png";
import freepassBlueIcon from "@/assets/icons/itinerary/freepass-blue.png";
import flagImg from "@/assets/place/flag.png";
import houseImg from "@/assets/place/house.png";
import busanStationImg from "@/assets/place/busan-station.png";
import type { Category } from "@/components/ui/CategoryChip";
import { itineraryApi } from "@/shared/api/domains";
import { FALLBACK_IMAGE } from "@/features/itinerary/utils/scheduleUtils";
import type { components } from "@/shared/api/schema";

// TODO: 그룹 공통 취향 API 연동 전까지는 대표 카테고리 3종 고정 표기
const COMMON_CATEGORIES: Category[] = ["sea", "culture", "nature"];

const PLAN_LABELS: Record<string, string> = {
  A: "취향 집중형",
  B: "균형 최적형",
  C: "자유 편집형",
};

type Place = { id: string; name: string; image: string };
type Day = { day: number; label: string; places: Place[] };
type Plan = { id: string; days: Day[]; voteCount: number };

type PlanOption = components["schemas"]["PlanOption"];

function mapPlanOption(planId: string, plan?: PlanOption): Plan {
  return {
    id: planId,
    voteCount: 0,
    days: (plan?.days ?? []).map((d, i) => ({
      day: d.day ?? i + 1,
      label: `Day ${d.day ?? i + 1}`,
      places: (d.spots ?? []).map((s, j) => ({
        id: s.contentId ?? `${planId}-${i}-${j}`,
        name: s.name ?? "",
        image: s.thumbnailUrl || FALLBACK_IMAGE,
      })),
    })),
  };
}

// TODO: API 연동 후 실제 방장 여부로 교체
const IS_HOST = true;

type FreepassModalStep = "guide" | "confirm" | null;

function ResultPlaceNode({ place }: { place: Place }) {
  return (
    <div className="relative flex min-w-0 flex-col items-center">
      <p className="absolute left-1/2 -top-[27px] max-w-[78px] -translate-x-1/2 truncate whitespace-nowrap text-center font-paperlogy text-xs font-normal text-text-heading">
        {place.name}
      </p>
      <span className="absolute left-1/2 -top-[11px] z-10 size-[11px] -translate-x-1/2 rounded-full border-[1.5px] border-main-blue bg-main-white" />
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
  const days = searchParams.get("days") ?? "3";
  const totalDays = Math.max(1, Number(days) || 3);
  const groupId = searchParams.get("groupId") ?? "";
  const tripName = searchParams.get("name") ?? "여행";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const forwardParams = new URLSearchParams({
    count,
    days: String(totalDays),
    groupId,
    name: tripName,
    startDate,
    endDate,
  }).toString();

  const {
    data: generated,
    isLoading: isGenerating,
    isError: isGenerateError,
  } = useQuery({
    queryKey: itineraryApi.keys.groupGenerate(groupId, startDate, endDate),
    queryFn: () => itineraryApi.generateGroupItinerary(groupId, { startDate, endDate }),
    enabled: !!groupId && !!startDate && !!endDate,
  });

  // days 수에 맞게 각 플랜 day 슬라이스
  const plans: Plan[] = [
    mapPlanOption("A", generated?.planA),
    mapPlanOption("B", generated?.planB),
    mapPlanOption("C", generated?.planC),
  ].map((plan) => ({
    ...plan,
    days: plan.days.slice(0, totalDays),
  }));

  const [activePlan, setActivePlan] = useState<string>("A");
  const [showInfo, setShowInfo] = useState(false);
  const [votedPlan, setVotedPlan] = useState<string | null>(null);
  const [voteConfirmPlan, setVoteConfirmPlan] = useState<string | null>(null);
  const [freepassModal, setFreepassModal] = useState<FreepassModalStep>(null);
  const [isFreepassMode, setIsFreepassMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const currentPlan = plans.find((p) => p.id === activePlan) ?? plans[0];

  const getVoteCount = (plan: Plan) => plan.voteCount + (votedPlan === plan.id ? 1 : 0);

  const handlePlanVote = (planId: string) => {
    setVoteConfirmPlan(planId);
  };

  const handleVoteConfirm = () => {
    if (!voteConfirmPlan) return;
    setActivePlan(voteConfirmPlan);
    setVotedPlan(voteConfirmPlan);
    setVoteConfirmPlan(null);
    router.push(`/itinerary/trips/vote-waiting?${forwardParams}`);
  };

  const handleFreepass = () => {
    setFreepassModal("guide");
  };

  const handleFreepassActivate = () => {
    setIsFreepassMode(true);
    setFreepassModal(null);
  };

  const handleFreepassConfirm = async () => {
    setFreepassModal(null);
    setIsConfirming(true);
    try {
      await itineraryApi.createItinerary({
        planType: activePlan,
        title: tripName,
        startAt: startDate,
        endAt: endDate,
        groupId,
      });
      setToastMessage(`방장이 ${activePlan}안을 선택했어요! 🎉`);
      window.setTimeout(() => {
        router.push("/itinerary");
      }, 1800);
    } catch {
      setToastMessage("일정을 확정하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="font-paperlogy font-medium text-md text-text-heading">
          일정을 생성하고 있어요...
        </p>
      </div>
    );
  }

  if (isGenerateError) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="font-paperlogy font-medium text-md text-text-heading text-center">
          일정 생성에 실패했어요.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

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
        {/* 헤더 - 고정 */}
        <div className="shrink-0 px-[28px] pt-[28px]">
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <span className="font-ssurround font-bold text-lg text-text-heading">
                마음에 드는 일정에 투표해주세요!
              </span>
              <button type="button" onClick={() => setShowInfo((v) => !v)} aria-label="투표 안내">
                <Image src={infoIcon} alt="안내" width={14} height={14} />
              </button>
            </div>

            {showInfo && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowInfo(false)} />
                <div className="absolute left-[60px] top-[calc(100%+8px)] z-20 rounded-[20px] border border-system-navbg bg-gradient-to-b from-system-glassfrom to-system-glassto px-[15px] py-[10px] backdrop-blur-[15px] shadow-sm">
                  <div className="flex flex-col gap-[10px] font-paperlogy text-2xs text-text-primary leading-snug whitespace-nowrap">
                    <p className="font-semibold">
                      😇 AI가 친구들의 취향을 분석해 3가지 일정을 추천해요.
                    </p>
                    <div className="flex flex-col gap-[6px]">
                      <p className="font-semibold">📌 A안 (취향 집중형)</p>
                      <p className="pl-5 font-medium">친구들의 취향을 균형 있게 반영한 일정</p>
                      <p className="font-semibold">📌 B안 (균형 최적형)</p>
                      <p className="pl-5 font-medium">친구들의 미수집 관광지 위주로 구성한 일정</p>
                      <p className="font-semibold">📌 C안 (자유 편집형)</p>
                      <p className="pl-5 font-medium">자유롭게 구성할 수 있는 일정</p>
                    </div>
                    <p className="font-medium">
                      ✅ 마음에 드는 일정에 투표해 최종 일정을 결정해요.
                    </p>
                    <p className="font-medium">
                      ✨ 방장은 투표 결과와 관계없이 원하는 일정을 선택할 수 있어요.
                    </p>
                    <p className="text-3xs font-semibold text-sub-coral">
                      ‼️ 프리패스 사용 시 참가자들의 투표 결과는 반영되지 않아요 ‼️
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 글래스 카드 - 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-[28px] pb-[10px]">
          <div className="relative -mx-[4px] mt-4 flex flex-col rounded-[20px] border border-system-navbg bg-gradient-to-b from-system-glassfrom to-system-glassto px-[16px] pt-[20px] pb-[24px] backdrop-blur-[15px]">
            {/* 안 선택 탭 + 투표 버튼 같은 라인 */}
            <div className="flex items-center gap-[5px]">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  aria-label={`${PLAN_LABELS[plan.id]} ${plan.id}안 보기`}
                  onClick={() => setActivePlan(plan.id)}
                  className={cn(
                    "flex items-center justify-center rounded-[10px] px-[12px] pt-[4px] pb-[2px] font-proup text-md text-main-white transition-colors",
                    activePlan === plan.id ? "bg-main-blue" : "bg-sub-lightblue",
                  )}
                >
                  {plan.id}
                </button>
              ))}
            </div>

            {/* 투표 버튼 - 우측 상단 절대 배치 */}
            <div className="absolute top-[16px] right-[16px] flex flex-col items-center gap-[4px]">
              <button
                type="button"
                aria-label={`${activePlan}안에 투표하기`}
                onClick={() => handlePlanVote(activePlan)}
                className={cn(
                  "flex items-center justify-center rounded-[10px] p-[5px]",
                  votedPlan === activePlan ? "bg-sub-pink" : "bg-sub-pink/50",
                )}
              >
                <Image src={checkIcon} alt="투표" width={14} height={14} aria-hidden />
              </button>
              <div className="flex items-center gap-[2px] font-proup text-sm font-normal leading-none text-sub-pink">
                <span>♥</span>
                <span>{getVoteCount(currentPlan)}</span>
              </div>
            </div>

            {/* 타임라인 */}
            {activePlan === "C" ? (
              <div className="mt-3 flex flex-col items-center justify-center gap-3 rounded-[14px] bg-system-navbg px-4 py-8 text-center">
                <span className="text-2xl">✏️</span>
                <p className="font-ssurround font-bold text-md text-text-heading">
                  자유 편집형 일정
                </p>
                <p className="font-paperlogy text-xs font-medium text-sub-darkgray leading-relaxed whitespace-pre-line">
                  {
                    "C안은 AI가 미리 짜주지 않아요.\n확정 후 팀원들과 함께 직접\n일정을 자유롭게 채워보세요!"
                  }
                </p>
              </div>
            ) : (
              <div className="relative mt-3 ml-0">
                {/* 세로 점선 — 출발 중심(top:22px)에서 도착 중심(bottom:24px)까지만 */}
                <div className="absolute left-[22px] top-[22px] bottom-[24px] w-[2px] bg-[repeating-linear-gradient(to_bottom,var(--color-sub-deepblue)_0,var(--color-sub-deepblue)_6px,transparent_6px,transparent_12px)]" />

                {/* 출발 - 부산역 */}
                <div className="relative flex items-center gap-5">
                  <div className="relative z-10 flex h-[49px] w-[45px] shrink-0 items-center justify-center">
                    <div className="absolute inset-[-6px] rounded-full bg-main-blue/30 blur-md" />
                    <Image
                      src={busanStationImg}
                      alt=""
                      width={45}
                      height={45}
                      aria-hidden
                      className="relative z-10"
                    />
                  </div>
                  <SpeechBubble variant="white" tailDirection="left">
                    <span className="font-paperlogy text-xs font-medium leading-none text-sub-deepblue">
                      10:00 여행 시작!
                    </span>
                  </SpeechBubble>
                </div>

                {/* 각 Day */}
                <div className="mt-[12px] flex flex-col gap-[52px]">
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
                    <div className="absolute inset-[-6px] rounded-full bg-main-blue/30 blur-md" />
                    <Image
                      src={houseImg}
                      alt=""
                      width={45}
                      height={45}
                      aria-hidden
                      className="relative z-10"
                    />
                  </div>
                  <SpeechBubble variant="white" tailDirection="left">
                    <span className="font-paperlogy text-xs font-medium leading-none text-sub-deepblue">
                      15:00 여행 끝!
                    </span>
                  </SpeechBubble>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 프리패스 버튼 - 하단 고정 */}
        <div className="shrink-0 px-[28px] pb-[24px] pt-[12px]">
          <button
            type="button"
            onClick={
              IS_HOST
                ? isFreepassMode
                  ? () => setFreepassModal("confirm")
                  : handleFreepass
                : undefined
            }
            disabled={!IS_HOST || isConfirming}
            className={cn(
              "flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] font-ssurround font-bold text-md text-main-white transition-opacity",
              IS_HOST ? "bg-main-blue" : "bg-sub-gray cursor-not-allowed",
            )}
          >
            {isConfirming ? (
              <span>일정 확정 중...</span>
            ) : isFreepassMode ? (
              <span>✦ {activePlan} 일정으로 선택</span>
            ) : (
              <>
                <Image
                  src={freepassBlueIcon}
                  alt=""
                  width={15}
                  height={15}
                  aria-hidden
                  className="-translate-y-0.5 brightness-0 invert"
                />
                <span>방장 마음대로 프리패스!</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={voteConfirmPlan !== null}
        onClose={() => setVoteConfirmPlan(null)}
        icon={<Image src={checkIcon} alt="" width={20} height={20} aria-hidden />}
        iconClassName="bg-sub-pink/30"
        title="이 일정으로 투표할까요?"
        description={`${voteConfirmPlan}안에 투표하시겠어요?`}
        cancelText="취소"
        confirmText="투표하기"
        onCancel={() => setVoteConfirmPlan(null)}
        onConfirm={handleVoteConfirm}
        className="max-w-[320px] rounded-[28px] px-7 py-9"
      />

      <Modal
        isOpen={freepassModal === "guide"}
        onClose={() => setFreepassModal(null)}
        icon={<Image src={freepassBlueIcon} alt="" width={25} height={25} aria-hidden />}
        iconClassName="bg-system-navbg"
        title="방장 마음대로 프리패스!"
        description={"투표 결과와 상관없이\n방장이 원하는 추천 일정을 선택할 수 있어요."}
        childrenVariant="card"
        childrenClassName="py-2"
        cancelText="취소"
        confirmText="프리패스"
        onCancel={() => setFreepassModal(null)}
        onConfirm={handleFreepassActivate}
        className="max-w-[320px] rounded-[28px] px-7 py-9 gap-7"
      >
        <p className="text-center font-paperlogy text-xs font-medium text-sub-darkgray">
          * 사용 시 현재 투표 결과는 반영되지 않아요.
        </p>
      </Modal>

      <Modal
        isOpen={freepassModal === "confirm"}
        onClose={() => setFreepassModal(null)}
        icon={<Image src={freepassBlueIcon} alt="" width={25} height={25} aria-hidden />}
        iconClassName="bg-system-navbg"
        title="방장 마음대로 프리패스!"
        description={`${activePlan} 일정으로 선택하시겠어요?\n선택한 일정이 최종 일정으로 확정돼요.`}
        childrenVariant="card"
        childrenClassName="py-2"
        cancelText="취소"
        confirmText="확정하기"
        onCancel={() => setFreepassModal(null)}
        onConfirm={handleFreepassConfirm}
        className="max-w-[320px] rounded-[28px] px-7 py-9 gap-7"
      >
        <p className="text-center font-paperlogy text-xs font-medium text-sub-darkgray">
          * 다른 사람의 일정을 불러오면 현재 일정은 사라져요.
        </p>
      </Modal>

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
      />
    </div>
  );
}
