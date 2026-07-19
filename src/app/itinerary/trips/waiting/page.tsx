"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ParticipantAvatarGrid } from "@/features/itinerary/components";
import { LoadingState } from "@/components";

// TODO: API 연동 시 실시간 완료 인원으로 교체
// 백엔드 테스트를 위해 자동 완료 시뮬레이션을 잠시 꺼둠 (아래 useEffect와 함께 주석 처리됨)
// const MOCK_AUTO_COMPLETE_DELAY_MS = 4000;

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
  const forwardParams = new URLSearchParams({
    count: String(totalSlots),
    days,
    groupId: searchParams.get("groupId") ?? "",
    name: searchParams.get("name") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    startTime: searchParams.get("startTime") ?? "",
    endTime: searchParams.get("endTime") ?? "",
  }).toString();

  // 나는 이미 완료 → 1명 done으로 시작
  const [doneCount, setDoneCount] = useState(1);

  // 임시: 일정 시간 후 전원 완료 시뮬레이션
  // 백엔드에서 실제 대기 화면 동작을 테스트할 수 있도록 자동 완료를 잠시 주석 처리함.
  // useEffect(() => {
  //   if (doneCount >= totalSlots) return;
  //   const timer = window.setTimeout(() => setDoneCount(totalSlots), MOCK_AUTO_COMPLETE_DELAY_MS);
  //   return () => window.clearTimeout(timer);
  // }, [doneCount, totalSlots]);

  // 전원 완료 시 결과 페이지로 이동
  useEffect(() => {
    if (doneCount < totalSlots) return;
    const timer = window.setTimeout(() => {
      router.push(`/itinerary/trips/result?${forwardParams}`);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [doneCount, totalSlots, router, forwardParams]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[30px] py-[50px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 안내 문구 */}
        <p
          className="font-paperlogy font-medium text-xl text-text-heading text-center"
          style={{ lineHeight: "23px" }}
        >
          {doneCount >= totalSlots ? (
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
