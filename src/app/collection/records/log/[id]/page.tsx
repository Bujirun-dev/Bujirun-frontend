"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageCard } from "@/components";
import { cn } from "@/shared/utils";
import { SwitchButton } from "@/features/collection/components/SwitchButton";
import { DayBadge } from "@/features/collection/components/DayBadge";
import { TagChips } from "@/features/collection/components/TagChips";
import {
  SAMPLE_LOGS,
  type DaySchedule,
  type ScheduleStop,
} from "@/features/collection/data/sampleLogs";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const log = SAMPLE_LOGS.find((l) => l.id === id);

  if (!log) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray text-sm">
          로그를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  const handleVisibilityToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const summaryPlace =
    log.extraCount > 0 ? `${log.placeName} 외 ${log.extraCount}곳` : log.placeName;

  const currentIsVisible = isVisible || log.isVisible;

  return (
    <PageCard>
      {/* 헤더 */}
      <div className="flex items-center gap-4 pb-4 shrink-0">
        <button onClick={() => router.back()} className="flex items-center justify-center shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-sub-gray"
            aria-hidden="true"
          >
            <path d="M17.17,24a1,1,0,0,1-.71-.29L8.29,15.54a5,5,0,0,1,0-7.08L16.46.29a1,1,0,1,1,1.42,1.42L9.71,9.88a3,3,0,0,0,0,4.24l8.17,8.17a1,1,0,0,1,0,1.42A1,1,0,0,1,17.17,24Z" />
          </svg>
        </button>
        <span className="font-ssurround font-bold text-lg text-text-heading flex-1">
          {log.title}
        </span>
        <SwitchButton isPublic={currentIsVisible} onClick={handleVisibilityToggle} />
      </div>

      {/* 요약 정보 카드 */}
      <div className="shrink-0 mb-5 backdrop-blur-[15px] bg-gradient-to-b from-system-glassfrom to-system-glassto border border-system-glassborder rounded-2xl h-[67px] flex flex-col justify-center px-5 gap-2">
        <div className="flex items-center gap-1">
          <span className="text-md shrink-0">📍</span>
          <span className="font-medium text-md text-text-primary tracking-[0.28px]">
            {summaryPlace}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm shrink-0">📅</span>
          <span className="font-medium text-sm text-sub-darkgray tracking-[0.24px]">
            {log.duration} · {log.date}
          </span>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-6">
        {log.days.map((daySchedule: DaySchedule) => (
          <div key={daySchedule.day} className="flex flex-col">
            {/* Day 헤더 */}
            <div className="flex items-center gap-2 mb-3.5">
              <DayBadge day={daySchedule.day} />
              <span className="font-ssurround font-bold text-xs text-sub-gray">
                {daySchedule.date}
              </span>
            </div>

            {/* 타임라인 */}
            <div className="relative flex flex-col pb-1.5">
              {/* 세로 선 */}
              <div className="absolute top-[6px] bottom-[6px] left-[45px] w-[2px] bg-sub-lightgray rounded-full" />
              {daySchedule.stops.map((stop: ScheduleStop, idx: number) => (
                <div
                  key={idx}
                  className={cn("flex items-start", idx < daySchedule.stops.length - 1 && "pb-5")}
                >
                  {/* 시간 + 도트 */}
                  <div className="flex items-center shrink-0">
                    <div className="w-10 text-right pr-2.5">
                      <span className="font-medium text-sm text-sub-deepblue tracking-[0.6px]">
                        {stop.time}
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-main-blue shrink-0 relative z-10" />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 flex flex-col gap-2.5 pl-2">
                    {/* 장소명 */}
                    <div className="flex items-center gap-1">
                      <span className="text-md shrink-0">📍</span>
                      <span className="font-medium text-md text-text-primary tracking-[0.42px]">
                        {stop.place}
                      </span>
                    </div>

                    {/* 사진 */}
                    {stop.imageUrl && (
                      <div className="relative w-[254px] h-[118px] rounded-lg overflow-hidden border-[0.3px] border-system-glassborder shrink-0">
                        <Image src={stop.imageUrl} alt={stop.place} fill className="object-cover" />
                      </div>
                    )}

                    {/* 태그 */}
                    <TagChips tags={stop.tags} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageCard>
  );
}
