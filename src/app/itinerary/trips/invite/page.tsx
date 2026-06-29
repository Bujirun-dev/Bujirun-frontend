"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import faceImg from "@/assets/character/face.png";
import { Toast } from "@/components";
import { cn } from "@/shared/utils";

// 친구 수별 행 배치 (각 행에 몇 명씩)
const SLOT_LAYOUTS: Record<number, number[]> = {
  2: [2],
  3: [3],
  4: [2, 2],
  5: [2, 3],
  6: [3, 3],
};

function buildRows(total: number): number[][] {
  const rowCounts = SLOT_LAYOUTS[total] ?? [3, 3];
  let idx = 0;
  return rowCounts.map((count) => {
    const row = Array.from({ length: count }, () => idx++);
    return row;
  });
}

function AvatarSlot({ joined }: { joined: boolean }) {
  return (
    <div
      className={cn(
        "relative size-[72px] rounded-full flex items-center justify-center overflow-hidden",
        joined ? "bg-main-blue" : "border-2 border-dashed border-main-blue bg-sub-lightblue",
      )}
    >
      <div
        className={cn(
          "relative size-[84px] shrink-0 rounded-full",
          !joined && "opacity-30 grayscale",
        )}
      >
        <Image src={faceImg} alt="" fill className="object-cover" aria-hidden />
      </div>
    </div>
  );
}

export default function TripInvitePage() {
  return (
    <Suspense fallback={null}>
      <TripInviteContent />
    </Suspense>
  );
}

function TripInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || 6));
  const joinedCount = totalSlots; // mock - 실제로는 API에서 받아옴 (다 들어온 상태로 처리)
  const rows = buildRows(totalSlots);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (joinedCount < totalSlots) return;
    const timer = setTimeout(() => {
      router.push(`/itinerary/trips/personality?count=${totalSlots}`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [joinedCount, totalSlots, router]);

  const handleInvite = async () => {
    // TODO: API 연동 후 실제 tripId로 교체
    const tripId = searchParams.get("tripId") ?? "MOCK_TRIP_ID";
    const inviteUrl = `${window.location.origin}/join/${tripId}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let slotIdx = 0;

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-6 py-[40px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 안내 문구 */}
        <p
          className="font-paperlogy font-medium text-xl text-text-heading text-center"
          style={{ lineHeight: "23px" }}
        >
          친구들이 모두 모이면
          <br />
          일정을 짜러 갈 수 있어요 🥰
        </p>

        {/* 참여 카운트 */}
        <p className="mt-[27px] font-paperlogy font-bold text-md text-sub-deepblue text-center">
          ( {joinedCount} / {totalSlots} )
        </p>

        {/* 친구 아바타 - 친구 수별 행 배치 */}
        <div className="mt-5 flex flex-col items-center gap-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-x-4">
              {row.map(() => {
                const idx = slotIdx++;
                return <AvatarSlot key={idx} joined={idx < joinedCount} />;
              })}
            </div>
          ))}
        </div>

        {/* 친구 초대 링크 */}
        <button
          type="button"
          onClick={handleInvite}
          className="mt-[27px] font-paperlogy font-normal text-sm text-text-primary underline decoration-solid underline-offset-2"
        >
          친구 초대하기
        </button>

        <Toast isVisible={copied} message="링크가 복사되었어요 !" onHide={() => setCopied(false)} />
      </div>
    </div>
  );
}
