"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { LoadingState } from "@/components";
import { swipeApi } from "@/shared/api/domains";

function PageLoadingFallback() {
  return (
    <div className="flex h-full flex-col">
      <LoadingState />
    </div>
  );
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
  const forwardParams = new URLSearchParams({
    count: String(totalSlots),
    days,
    groupId,
    name: searchParams.get("name") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    startTime: searchParams.get("startTime") ?? "",
    endTime: searchParams.get("endTime") ?? "",
  }).toString();

  const { data: swipeStatus } = useQuery({
    queryKey: swipeApi.keys.status(groupId),
    queryFn: () => swipeApi.getSwipeStatus(groupId),
    enabled: !!groupId,
    refetchInterval: 2000,
  });
  const doneCount = Math.min(totalSlots, swipeStatus?.doneCount ?? 0);
  const allDone = swipeStatus?.allDone ?? doneCount >= totalSlots;

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
      </div>
    </div>
  );
}
