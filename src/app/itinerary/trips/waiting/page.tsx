"use client";

import Image from "next/image";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import faceImg from "@/assets/character/face.png";
import { cn } from "@/shared/utils";

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

function AvatarSlot({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        "relative size-[72px] rounded-full flex items-center justify-center overflow-hidden",
        done ? "bg-main-blue" : "border-2 border-dashed border-main-blue bg-sub-lightblue",
      )}
    >
      <div
        className={cn(
          "relative size-[84px] shrink-0 rounded-full",
          !done && "opacity-30 grayscale",
        )}
      >
        <Image src={faceImg} alt="" fill className="object-cover" aria-hidden />
      </div>
    </div>
  );
}

export default function TripWaitingPage() {
  return (
    <Suspense fallback={null}>
      <TripWaitingContent />
    </Suspense>
  );
}

function TripWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSlots = Math.min(6, Math.max(2, Number(searchParams.get("count")) || 6));
  // TODO: API 연동 후 실제 완료 인원으로 교체
  const doneCount = Math.ceil(totalSlots / 2);
  const rows = buildRows(totalSlots);

  useEffect(() => {
    if (doneCount < totalSlots) return;
    const timer = setTimeout(() => {
      router.push(`/itinerary/trips/result?count=${totalSlots}`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [doneCount, totalSlots, router]);

  let slotIdx = 0;

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-16">
      <div className="w-full rounded-[30px] border border-white/40 bg-gradient-to-b from-system-glassfrom to-system-glassto px-[30px] py-[50px] backdrop-blur-[15px] flex flex-col items-center">
        {/* 안내 문구 */}
        <p
          className="font-paperlogy font-medium text-xl text-text-heading text-center"
          style={{ lineHeight: "23px" }}
        >
          친구들이 아직 취향분석 중이에요...
          <br />
          잠시만 기다려주세요 😇
        </p>

        {/* 완료 카운트 */}
        <p className="mt-[27px] font-paperlogy font-bold text-md text-sub-deepblue text-center">
          ( {doneCount} / {totalSlots} )
        </p>

        {/* 친구 아바타 - 친구 수별 행 배치 */}
        <div className="mt-5 flex flex-col items-center gap-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-x-4">
              {row.map(() => {
                const idx = slotIdx++;
                return <AvatarSlot key={idx} done={idx < doneCount} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
