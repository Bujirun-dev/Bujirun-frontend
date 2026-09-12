"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Toast, Button, LoadingState } from "@/components";
import EmergencyIcon from "@/assets/icons/itinerary/emergency-on.svg?svgr";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { itineraryApi } from "@/shared/api/domains";
import { useIsGroupHost } from "@/features/itinerary/hooks/useIsGroupHost";
import { useVoteSessionPolling } from "@/features/itinerary/hooks/useVoteSessionPolling";
import { useItineraryGenerationLockStore, useItineraryFlowStore } from "@/shared/stores";
import { useItineraryFlowProgress } from "@/features/itinerary/hooks/useItineraryFlowProgress";
import {
  formatRemainingTime,
  useItineraryFlowTimer,
} from "@/features/itinerary/hooks/useItineraryFlowTimer";

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

function PageLoadingFallback() {
  return (
    <div className="flex h-full flex-col">
      <LoadingState />
    </div>
  );
}

export default function VoteWaitingPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
  const groupId = searchParams.get("groupId") ?? "";
  const isHost = useIsGroupHost(groupId);
  const tripName = searchParams.get("name") ?? "여행";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";
  const accommodation = searchParams.get("accommodation") ?? "";
  const accommodationAddress = searchParams.get("accommodationAddress") ?? "";
  const accommodationLat = searchParams.get("accommodationLat") ?? "";
  const accommodationLng = searchParams.get("accommodationLng") ?? "";
  const [selectedTiePlan, setSelectedTiePlan] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<
    "success" | "error" | "warning" | "itinerary" | "default"
  >("default");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  // 10분 제한이 지난 뒤 방장이 "지금 표로 확정"을 눌렀는데 동률이면, 전원 투표 전이라도
  // 기존 동률 모달을 띄워서 방장이 직접 고르게 한다.
  const [isHostSkipping, setIsHostSkipping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const { remainingMs, isOver } = useItineraryFlowTimer();
  const unlockGeneration = useItineraryGenerationLockStore((state) => state.unlock);
  const clearFlow = useItineraryFlowStore((state) => state.clearFlow);
  const queryClient = useQueryClient();

  useItineraryFlowProgress("vote-waiting", searchParams.toString(), groupId, {
    sessionId,
    tripName,
  });

  // 확정 직후엔 일정 목록 캐시(staleTime 60초)에 새 일정이 아직 없다. 그대로 /itinerary로
  // 보내면 목록에서 못 찾고 "직전에 보던 일정"으로 폴백해서 예전 일정이 열린다.
  // 그래서 목록을 무효화하고, 방금 만들어진 일정 id를 tripId로 직접 지정해서 이동한다.
  const goToNewItinerary = async (itineraryId?: string) => {
    unlockGeneration();
    clearFlow();
    try {
      // 비활성 상태인 목록 캐시도 실제로 다시 받아온 뒤 이동해야, 일정 탭이 새 id를
      // 아직 모르는 상태에서 기존 일정으로 폴백하지 않는다.
      await queryClient.invalidateQueries({
        queryKey: itineraryApi.keys.lists(),
        refetchType: "all",
      });
    } finally {
      router.push(itineraryId ? `/itinerary?tripId=${itineraryId}` : "/itinerary");
    }
  };

  // 방장이 finalize를 호출하면 status가 "confirmed"로 바뀐다. 이는 클라이언트가
  // voteCounts로 계산한 winnerPlan/동률 로직과 별개로 백엔드가 실제로 확정했음을
  // 보장하는 신호라서, 동률이라 방장 선택을 기다리던 참여자를 포함해 전원을
  // 확실하게 일정 화면으로 보낸다.
  const { voteStatus } = useVoteSessionPolling(sessionId, {
    onConfirmed: (_sessionId, itineraryId) => goToNewItinerary(itineraryId),
    onError: () => {
      setToastVariant("error");
      setToastMessage("투표 현황을 불러오지 못했어요.");
    },
  });
  const voteCounts = voteStatus?.voteCounts ?? {};
  const doneCount = Math.min(totalSlots, voteStatus?.totalVotes ?? 0);
  const winnerPlan = getWinnerPlan(voteCounts);
  const tiedPlans = getTiedPlans(voteCounts);
  const showTieModal = (doneCount >= totalSlots || isHostSkipping) && !winnerPlan && !selectedTiePlan;

  // 제한 시간이 지나면 방장은 아직 투표 안 한 사람을 기다리지 않고 현재 표로 확정할 수 있다.
  const handleHostSkip = () => {
    setShowSkipConfirm(false);
    if (winnerPlan) {
      setToastVariant("success");
      setToastMessage(`${winnerPlan}안이 최다 투표로 선택됐어요! 🎉`);
      void confirmPlan(winnerPlan);
      return;
    }
    if (tiedPlans.length > 1) {
      setIsHostSkipping(true);
      return;
    }
    setToastVariant("warning");
    setToastMessage("아직 투표한 사람이 없어요. 조금만 더 기다려주세요.");
  };

  const confirmPlan = async (planType: string) => {
    setIsConfirming(true);
    try {
      // 확정은 리더 전용 API라 방장 클라이언트만 실제로 호출하고,
      // 참여자는 방장이 확정할 때까지 기다렸다가 같은 화면 흐름으로 넘어간다.
      // itineraryId 없이 먼저 이동하면 기존 일정이 선택되고 폴링도 중단된다.
      // 참여자는 onConfirmed에서 새 id를 받을 때까지 이 화면에서 대기한다.
      if (!isHost) return;

      // finalize 요청에 숙소/시간까지 함께 실어서 원자적으로 저장한다 — 세션이
      // "confirmed"로 바뀌는 시점과 숙소 저장 시점 사이에 참여자가 일정 화면으로
      // 넘어가버려 숙소 정보가 비어 보이던 race condition을 없애기 위함.
      const newItineraryId = await itineraryApi.finalizeItinerary(sessionId, {
        freePass: false,
        selectedPlan: planType,
        title: tripName,
        startDate,
        endDate,
        startTime,
        endTime,
        accommodationName: accommodation,
        accommodationAddress,
        ...(accommodationLat ? { accommodationLat: Number(accommodationLat) } : {}),
        ...(accommodationLng ? { accommodationLng: Number(accommodationLng) } : {}),
        // C안(자유 편집형)은 AI가 만든 내용이 없어서, 빈 Day만 일수에 맞게 만들어달라고 명시해야 한다.
        ...(planType === "C"
          ? {
              days: Array.from({ length: totalDays }, (_, i) => ({
                day: i + 1,
                spotContentIds: [],
              })),
            }
          : {}),
      });
      goToNewItinerary(newItineraryId);
    } catch {
      setToastVariant("error");
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
      setToastVariant("success");
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
    setToastVariant("success");
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

        {/* 10분 제한 — 투표를 안 하고 사라진 사람 때문에 그룹 전체가 갇히지 않게,
            제한이 지나면 방장이 현재 표로 확정할 수 있다. */}
        {doneCount < totalSlots && (
          <div className="mt-5 flex w-full flex-col items-center gap-2">
            {isOver ? (
              isHost ? (
                <>
                  <p className="text-center font-paperlogy text-sm font-normal text-text-primary">
                    10분이 지났어요. 지금 표로 확정할 수 있어요.
                  </p>
                  <Button
                    variant="warning"
                    onClick={() => setShowSkipConfirm(true)}
                    disabled={isConfirming}
                  >
                    {isConfirming ? "확정 중..." : "지금 표로 확정하기"}
                  </Button>
                </>
              ) : (
                <p className="text-center font-paperlogy text-sm font-normal text-text-primary">
                  10분이 지났어요. 방장이 지금 표로 확정할 수 있어요.
                </p>
              )
            ) : (
              <p className="text-center font-paperlogy text-sm font-normal text-sub-darkgray">
                {formatRemainingTime(remainingMs)} 후에는 방장이 바로 확정할 수 있어요
              </p>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        confirmVariant="warning"
        icon={<EmergencyIcon width={25} height={25} className="text-sub-coral" aria-hidden />}
        title="지금 표로 확정할까요?"
        description={"아직 투표하지 않은 친구의 표는\n반영되지 않아요."}
        cancelText="더 기다리기"
        confirmText="확정하기"
        onCancel={() => setShowSkipConfirm(false)}
        onConfirm={handleHostSkip}
      />

      {/* 동률 모달 */}
      <Modal
        isOpen={showTieModal}
        onClose={() => {}}
        hideCloseButton
        title="투표 동률이에요!"
        description={
          isHost
            ? `${tiedPlans.join("안과 ")}안이 같은 표를 받았어요.\n방장이 최종 일정을 선택해주세요.`
            : `${tiedPlans.join("안과 ")}안이 같은 표를 받았어요.\n방장이 최종 일정을 선택 중이에요...`
        }
        childrenVariant="card"
        hideActions
        footer={
          isHost ? (
            <div className="flex w-full gap-3">
              {tiedPlans.map((plan) => (
                <Button
                  key={plan}
                  variant="primary"
                  onClick={() => handleTiePick(plan)}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  {isConfirming ? "확정 중..." : `${plan}안 선택`}
                </Button>
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
                <div className="flex items-center gap-[2px] font-proup text-sm font-normal leading-none text-sub-pink">
                  <span>♥</span>
                  <span>{voteCounts[plan] ?? 0}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </Modal>

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        variant={toastVariant}
      />
    </div>
  );
}
