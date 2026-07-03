"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Toast } from "@/components";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";

// TODO: API 연동 후 실제 투표 집계 결과로 교체
// 동률 테스트: { A: 3, B: 3, C: 0 } / 단독 1위 테스트: { A: 3, B: 2, C: 1 }
const MOCK_VOTE_RESULT: Record<string, number> = { A: 3, B: 3, C: 0 };
const MOCK_AUTO_COMPLETE_DELAY_MS = 4000;

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
  const days = searchParams.get("days") ?? "1";
  const [doneCount, setDoneCount] = useState(
    Math.min(totalSlots, Math.max(0, Number(searchParams.get("done")) || totalSlots - 1)),
  );
  const [selectedTiePlan, setSelectedTiePlan] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const winnerPlan = getWinnerPlan(MOCK_VOTE_RESULT);
  const tiedPlans = getTiedPlans(MOCK_VOTE_RESULT);
  const showTieModal = doneCount >= totalSlots && !winnerPlan && !selectedTiePlan;

  // 임시: 일정 시간 후 투표 완료 시뮬레이션
  useEffect(() => {
    if (doneCount >= totalSlots) return;
    const timer = window.setTimeout(() => setDoneCount(totalSlots), MOCK_AUTO_COMPLETE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [doneCount, totalSlots]);

  // 전원 투표 완료 처리
  useEffect(() => {
    if (doneCount < totalSlots) return;

    if (!winnerPlan) return;

    // 단독 1위: 토스트 후 일정 메인 이동
    const toastTimer = window.setTimeout(() => {
      setToastMessage(`${winnerPlan}안이 최다 투표로 선택됐어요! 🎉`);
    }, 0);
    const timer = window.setTimeout(() => {
      router.push(`/itinerary?count=${totalSlots}&days=${days}&plan=${winnerPlan}`);
    }, 1800);
    return () => {
      window.clearTimeout(toastTimer);
      window.clearTimeout(timer);
    };
  }, [days, doneCount, totalSlots, router, winnerPlan]);

  const handleTiePick = (plan: string) => {
    setSelectedTiePlan(plan);
    setToastMessage(`방장이 ${plan}안을 선택했어요! 🎉`);
    window.setTimeout(() => {
      router.push(`/itinerary?count=${totalSlots}&days=${days}&plan=${plan}`);
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
                  className="flex-1 rounded-lg bg-main-blue py-2.5 font-ssurround text-md font-bold text-white active:opacity-70"
                >
                  {plan}안 선택
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
