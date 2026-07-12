"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Modal, Toast } from "@/components";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { itineraryApi } from "@/shared/api/domains";
import { saveTripTimeBounds } from "@/shared/utils/tripTimeBounds";

// TODO: API 연동 시 실제 방장 여부로 교체
const IS_HOST = true;

function getWinnerPlan(votes: Record<string, number>): string | null {
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  if (sorted.length < 2) return sorted[0]?.[0] ?? null;
  // 동률이면 null 반환
  if (sorted[0][1] === sorted[1][1]) return null;
  return sorted[0][0];
}

function getTiedPlans(votes: Record<string, number>): string[] {
  const max = Math.max(...Object.values(votes));
  return Object.entries(votes)
    .filter(([, v]) => v === max)
    .map(([k]) => k);
}

export default function VoteWaitingPage() {
  return (
    <Suspense fallback={null}>
      <VoteWaitingContent />
    </Suspense>
  );
}

function VoteWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || 6));
  const totalDays = Math.max(1, Number(searchParams.get("days")) || 1);
  const sessionId = searchParams.get("sessionId") ?? "";
  const tripName = searchParams.get("name") ?? "여행";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";
  const [selectedTiePlan, setSelectedTiePlan] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: voteStatus } = useQuery({
    queryKey: itineraryApi.keys.voteStatus(sessionId),
    queryFn: () => itineraryApi.getVoteStatus(sessionId),
    enabled: !!sessionId,
    refetchInterval: 2000,
  });
  const voteCounts = voteStatus?.voteCounts ?? {};
  const doneCount = Math.min(totalSlots, voteStatus?.totalVotes ?? 0);
  const winnerPlan = getWinnerPlan(voteCounts);
  const tiedPlans = getTiedPlans(voteCounts);
  const showTieModal = doneCount >= totalSlots && !winnerPlan && !selectedTiePlan;

  const confirmPlan = async (planType: string) => {
    setIsConfirming(true);
    try {
      // 확정은 리더 전용 API라 방장 클라이언트만 실제로 호출하고,
      // 참여자는 방장이 확정할 때까지 기다렸다가 같은 화면 흐름으로 넘어간다.
      if (IS_HOST) {
        const newItineraryId = await itineraryApi.finalizeItinerary(sessionId, {
          freePass: false,
          selectedPlan: planType,
          title: tripName,
          startDate,
          endDate,
          // C안(자유 편집형)은 AI가 만든 내용이 없어서, 빈 Day만 일수에 맞게 만들어달라고 명시해야 한다.
          ...(planType === "C"
            ? { days: Array.from({ length: totalDays }, (_, i) => ({ day: i + 1, spotContentIds: [] })) }
            : {}),
        });
        if (newItineraryId) saveTripTimeBounds(newItineraryId, startTime, endTime);
      }
      router.push("/itinerary");
    } catch {
      setToastMessage("일정을 확정하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsConfirming(false);
    }
  };

  // 전원 투표 완료 처리
  useEffect(() => {
    if (doneCount < totalSlots) return;

    if (!winnerPlan) return;

    // 단독 1위: 토스트 후 일정 메인 이동
    const toastTimer = window.setTimeout(() => {
      setToastMessage(`${winnerPlan}안이 최다 투표로 선택됐어요! 🎉`);
    }, 0);
    const timer = window.setTimeout(() => {
      confirmPlan(winnerPlan);
    }, 1800);
    return () => {
      window.clearTimeout(toastTimer);
      window.clearTimeout(timer);
    };
    // confirmPlan은 매 렌더마다 새로 만들어져서 참조 자체를 deps에 넣으면 안 됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount, totalSlots, winnerPlan]);

  const handleTiePick = (plan: string) => {
    setSelectedTiePlan(plan);
    setToastMessage(`방장이 ${plan}안을 선택했어요! 🎉`);
    window.setTimeout(() => {
      confirmPlan(plan);
    }, 1800);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="flex w-full flex-col items-center rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[30px] py-[42px] backdrop-blur-[15px]">
        <p className="text-center font-paperlogy text-xl font-medium leading-[23px] text-text-heading">
          {doneCount >= totalSlots ? (
            <>
              투표가 완료됐어요! 🎉
              <br />
              일정을 확정하고 있어요...
            </>
          ) : (
            <>
              친구들이 아직 투표 중이에요...
              <br />
              잠시만 기다려주세요 😇
            </>
          )}
        </p>

        <p className="mt-[27px] text-center font-paperlogy text-md font-bold text-sub-deepblue">
          ( {doneCount} / {totalSlots} )
        </p>

        <ParticipantAvatarGrid total={totalSlots} activeCount={doneCount} className="mt-5" />

        {/* TEMP: 인원 다 안 모여도 확정 확인용 — 확인 끝나면 지울 것 */}
        <button
          type="button"
          onClick={() => confirmPlan(winnerPlan ?? "A")}
          disabled={isConfirming}
          className="mt-3 font-paperlogy font-normal text-xs text-sub-gray underline decoration-solid underline-offset-2 disabled:opacity-50"
        >
          {isConfirming ? "확정 중..." : "(테스트) 인원 상관없이 확정하기"}
        </button>
      </div>

      {/* 동률 모달 */}
      <Modal
        isOpen={showTieModal}
        onClose={() => {}}
        hideCloseButton
        title="투표 동률이에요!"
        description={
          IS_HOST
            ? `${tiedPlans.join("안과 ")}안이 같은 표를 받았어요.\n방장이 최종 일정을 선택해주세요.`
            : `${tiedPlans.join("안과 ")}안이 같은 표를 받았어요.\n방장이 최종 일정을 선택 중이에요...`
        }
        childrenVariant="card"
        hideActions
        footer={
          IS_HOST ? (
            <div className="flex w-full gap-3">
              {tiedPlans.map((plan) => (
                <button
                  key={plan}
                  onClick={() => handleTiePick(plan)}
                  disabled={isConfirming}
                  className="flex-1 rounded-lg bg-main-blue py-2.5 font-ssurround text-md font-bold text-white active:opacity-70 disabled:opacity-50"
                >
                  {isConfirming ? "확정 중..." : `${plan}안 선택`}
                </button>
              ))}
            </div>
          ) : undefined
        }
      >
        <div className="flex w-full items-center">
          {tiedPlans.map((plan, i) => (
            <Fragment key={plan}>
              {i > 0 && <div key={`divider-${i}`} className="h-8 w-[1px] bg-main-blue/30" />}
              <div className="flex flex-1 flex-col items-center gap-1">
                <span className="font-proup text-2xl text-main-blue">{plan}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </Modal>

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
      />
    </div>
  );
}
