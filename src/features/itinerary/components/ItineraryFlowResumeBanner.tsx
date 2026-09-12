"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Toast } from "@/components";
import EmergencyIcon from "@/assets/icons/itinerary/emergency-on.svg?svgr";
import { itineraryApi } from "@/shared/api/domains";
import {
  getItineraryFlowHref,
  isItineraryFlowExpired,
  useItineraryFlowStore,
  useItineraryGenerationLockStore,
} from "@/shared/stores";

function subscribeToFlowHydration(onChange: () => void) {
  return useItineraryFlowStore.persist.onFinishHydration(onChange);
}

function getFlowHydrationSnapshot() {
  return useItineraryFlowStore.persist.hasHydrated();
}

function getFlowHydrationServerSnapshot() {
  return false;
}

const STEP_LABELS: Record<string, string> = {
  invite: "친구 초대",
  personality: "취향 분석 시작",
  swipe: "취향 분석",
  waiting: "친구 취향 분석 대기",
  result: "일정 투표",
  "vote-waiting": "투표 결과 대기",
};

// 일정 생성 중에 앱이 튕기거나 화면을 벗어나면, 진행 상황이 URL 쿼리에만 있어서 그 사람만
// 플로우 밖으로 떨어지고 다시 들어갈 입구가 없었다. 저장된 진행 상황이 있으면 일정 탭에서
// 바로 이어갈 수 있게 안내한다.
export function ItineraryFlowResumeBanner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const flow = useItineraryFlowStore((state) => state.flow);
  const clearFlow = useItineraryFlowStore((state) => state.clearFlow);
  const unlockGeneration = useItineraryGenerationLockStore((state) => state.unlock);
  const [isResuming, setIsResuming] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // localStorage에서 복원되는 값이라 서버 렌더 결과와 다를 수 있다. 복원이 끝난 뒤에만
  // 그려서 하이드레이션 불일치를 피한다.
  const isHydrated = useSyncExternalStore(
    subscribeToFlowHydration,
    getFlowHydrationSnapshot,
    getFlowHydrationServerSnapshot,
  );

  // 하루가 지난 기록은 이미 확정됐거나 버려진 방이라 더 권하지 않는다.
  useEffect(() => {
    if (flow && isItineraryFlowExpired(flow)) clearFlow();
  }, [flow, clearFlow]);

  if (!isHydrated || !flow || isItineraryFlowExpired(flow)) return null;

  const handleResume = async () => {
    setIsResuming(true);
    try {
      // 내가 빠져 있는 동안 남은 사람들끼리 이미 확정했을 수 있다. 그때 투표 화면으로
      // 되돌리면 새 투표 세션이 만들어져 그룹이 갈라지므로, 확정된 일정으로 바로 보낸다.
      if (flow.sessionId) {
        const status = await queryClient.fetchQuery({
          queryKey: itineraryApi.keys.voteStatus(flow.sessionId),
          queryFn: () => itineraryApi.getVoteStatus(flow.sessionId as string),
        });
        if (status?.status === "confirmed") {
          clearFlow();
          unlockGeneration();
          await queryClient.invalidateQueries({
            queryKey: itineraryApi.keys.lists(),
            refetchType: "all",
          });
          setToastMessage("이미 일정이 확정됐어요. 확정된 일정으로 이동할게요.");
          router.push(status.itineraryId ? `/itinerary?tripId=${status.itineraryId}` : "/itinerary");
          return;
        }
      }
      router.push(getItineraryFlowHref(flow));
    } catch {
      // 세션 조회가 실패해도(만료/네트워크) 저장된 단계로는 돌아갈 수 있게 한다.
      router.push(getItineraryFlowHref(flow));
    } finally {
      setIsResuming(false);
    }
  };

  const handleGiveUp = () => {
    setShowGiveUpConfirm(false);
    clearFlow();
    unlockGeneration();
    setToastMessage("만들던 일정을 그만뒀어요. 초대 링크로 다시 들어올 수 있어요.");
  };

  return (
    <>
      <div className="mb-3.5 rounded-2xl border border-main-blue bg-system-navbg p-4">
        <p className="font-ssurround text-md font-bold text-sub-deepblue">
          만들던 일정이 있어요!
        </p>
        <p className="mt-1 font-paperlogy text-sm font-normal text-text-primary">
          {flow.tripName ? `${flow.tripName} · ` : ""}
          {STEP_LABELS[flow.step] ?? "일정 생성"} 단계에서 멈췄어요.
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={handleResume} disabled={isResuming}>
            {isResuming ? "확인 중..." : "이어서 만들기"}
          </Button>
          <Button variant="secondary" onClick={() => setShowGiveUpConfirm(true)}>
            그만두기
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showGiveUpConfirm}
        onClose={() => setShowGiveUpConfirm(false)}
        confirmVariant="warning"
        icon={<EmergencyIcon width={25} height={25} className="text-sub-coral" aria-hidden />}
        title="그만둘까요?"
        description={
          "친구들이 아직 기다리고 있을 수 있어요.\n그만두면 이 안내가 사라지지만,\n초대 링크로는 다시 들어올 수 있어요."
        }
        cancelText="이어서 만들기"
        confirmText="그만두기"
        onCancel={() => setShowGiveUpConfirm(false)}
        onConfirm={handleGiveUp}
      />

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        variant="itinerary"
      />
    </>
  );
}
