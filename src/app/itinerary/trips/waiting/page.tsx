"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { Button, LoadingState, Modal } from "@/components";
import EmergencyIcon from "@/assets/icons/itinerary/emergency-on.svg?svgr";
import { swipeApi } from "@/shared/api/domains";
import { useIsGroupHost } from "@/features/itinerary/hooks/useIsGroupHost";
import { useItineraryFlowProgress } from "@/features/itinerary/hooks/useItineraryFlowProgress";
import {
  formatRemainingTime,
  useItineraryFlowTimer,
} from "@/features/itinerary/hooks/useItineraryFlowTimer";

function PageLoadingFallback() {
  return <LoadingState />;
}

export default function TripWaitingPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <TripWaitingContent />
    </Suspense>
  );
}

function TripWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || 6));
  const days = searchParams.get("days") ?? "1";
  const groupId = searchParams.get("groupId") ?? "";
  const accommodation = searchParams.get("accommodation") ?? "";
  const accommodationAddress = searchParams.get("accommodationAddress") ?? "";
  const accommodationLat = searchParams.get("accommodationLat") ?? "";
  const accommodationLng = searchParams.get("accommodationLng") ?? "";
  const forwardParams = new URLSearchParams({
    count: String(totalSlots),
    days,
    groupId,
    name: searchParams.get("name") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    startTime: searchParams.get("startTime") ?? "",
    endTime: searchParams.get("endTime") ?? "",
    ...(accommodation ? { accommodation } : {}),
    ...(accommodationAddress ? { accommodationAddress } : {}),
    ...(accommodationLat ? { accommodationLat } : {}),
    ...(accommodationLng ? { accommodationLng } : {}),
  }).toString();

  useItineraryFlowProgress("waiting", searchParams.toString(), groupId, {
    tripName: searchParams.get("name") ?? undefined,
  });

  const isHost = useIsGroupHost(groupId);
  const { remainingMs, isOver } = useItineraryFlowTimer();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const { data: swipeStatus } = useQuery({
    queryKey: swipeApi.keys.status(groupId),
    queryFn: () => swipeApi.getSwipeStatus(groupId),
    enabled: !!groupId,
    refetchInterval: 2000,
  });
  const doneCount = Math.min(totalSlots, swipeStatus?.doneCount ?? 0);
  const allDone = swipeStatus?.allDone ?? doneCount >= totalSlots;

  const goToResult = () => {
    router.push(`/itinerary/trips/result?${forwardParams}`);
  };

  // 전원 완료 시 결과 페이지로 이동
  useEffect(() => {
    if (!allDone) return;
    const timer = window.setTimeout(() => {
      router.push(`/itinerary/trips/result?${forwardParams}`);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [allDone, router, forwardParams]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[30px] py-[50px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 안내 문구 */}
        <p
          className="font-paperlogy font-medium text-xl text-text-heading text-center"
          style={{ lineHeight: "23px" }}
        >
          {allDone ? (
            <>
              모두 완료됐어요! 🎉
              <br />
              결과를 불러오고 있어요...
            </>
          ) : (
            <>
              친구들이 아직 취향분석 중이에요...
              <br />
              잠시만 기다려주세요 😇
            </>
          )}
        </p>

        {/* 완료 카운트 */}
        <p className="mt-[27px] font-paperlogy font-bold text-md text-sub-deepblue text-center">
          ( {doneCount} / {totalSlots} )
        </p>

        {/* 친구 아바타 - 친구 수별 행 배치 */}
        <ParticipantAvatarGrid total={totalSlots} activeCount={doneCount} className="mt-5" />

        {/* 10분 제한 — 중간에 튕겨서 안 돌아오는 사람 한 명 때문에 그룹 전체가
            영구히 갇히지 않도록, 제한이 지나면 방장이 먼저 진행할 수 있다. */}
        {!allDone && (
          <div className="mt-5 flex w-full flex-col items-center gap-2">
            {isOver ? (
              isHost ? (
                <>
                  <p className="text-center font-paperlogy text-sm font-normal text-text-primary">
                    10분이 지났어요. 기다리지 않고 진행할 수 있어요.
                  </p>
                  <Button variant="warning" onClick={() => setShowSkipConfirm(true)}>
                    기다리지 않고 진행하기
                  </Button>
                </>
              ) : (
                <p className="text-center font-paperlogy text-sm font-normal text-text-primary">
                  10분이 지났어요. 방장이 먼저 진행할 수 있어요.
                </p>
              )
            ) : (
              <p className="text-center font-paperlogy text-sm font-normal text-sub-darkgray">
                {formatRemainingTime(remainingMs)} 후에는 방장이 바로 진행할 수 있어요
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
        title="기다리지 않고 진행할까요?"
        description={
          "아직 취향분석을 안 한 친구는\n이번 추천에 취향이 반영되지 않아요.\n(일정에서 빠지는 건 아니에요)"
        }
        cancelText="더 기다리기"
        confirmText="진행하기"
        onCancel={() => setShowSkipConfirm(false)}
        onConfirm={() => {
          setShowSkipConfirm(false);
          goToResult();
        }}
      />
    </div>
  );
}
