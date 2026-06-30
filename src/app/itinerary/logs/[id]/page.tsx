"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AngleLeftIcon from "@/assets/icons/itinerary/angle-left.svg?svgr";
import calendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg?url";
import { PageCard } from "@/components";
import { cn } from "@/shared/utils";
import { DayBadge } from "@/features/itinerary";
import {
  SAMPLE_LOGS,
  type DaySchedule,
  type ScheduleStop,
} from "@/features/itinerary/data/sampleLogs";

function TagChip({ label, isLight }: { label: string; isLight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md inline-flex items-center justify-center px-1.5 py-1",
        isLight ? "bg-category-sea" : "bg-main-blue",
      )}
    >
      <span
        className={cn(
          "font-normal text-xs text-center tracking-[0.16px]",
          isLight ? "text-text-primary" : "text-main-white",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importTimerRef = useRef<number | null>(null);
  const log = SAMPLE_LOGS.find((l) => l.id === id);

  useEffect(() => {
    return () => {
      const timerId = importTimerRef.current;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const handleCloseAddModal = () => {
    const timerId = importTimerRef.current;
    if (timerId) window.clearTimeout(timerId);
    importTimerRef.current = null;
    setIsImporting(false);
    setShowAddModal(false);
  };

  const handleImportLog = () => {
    setIsImporting(true);
    importTimerRef.current = window.setTimeout(() => {
      setIsImporting(false);
      setShowAddModal(false);
      router.push("/itinerary");
    }, 600);
  };

  if (!log) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray text-sm">
          로그를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  const summaryPlace =
    log.extraCount > 0 ? `${log.placeName} 외 ${log.extraCount}곳` : log.placeName;

  return (
    <PageCard>
      {/* 헤더 */}
      <div className="flex items-center gap-4 pb-4 shrink-0">
        <button onClick={() => router.back()} className="flex items-center justify-center shrink-0">
          <AngleLeftIcon width={16} height={16} className="fill-sub-gray" aria-hidden />
        </button>
        <span className="font-ssurround font-bold text-lg text-text-heading flex-1">
          {log.title}
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="size-[28px] rounded-lg bg-system-scroll border-[0.5px] border-main-blue flex items-center justify-center shrink-0"
        >
          <Image src={calendarPlusIcon} alt="" width={16} height={16} aria-hidden />
        </button>
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
                    <div className="flex items-center gap-1 flex-wrap">
                      {stop.tags.map((tag, tagIdx) => (
                        <TagChip key={tag} label={tag} isLight={tagIdx === 0} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-system-blackbg px-6"
          onClick={handleCloseAddModal}
        >
          <div
            className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-main-white px-6 py-7 shadow-[0_2px_8px_0_var(--color-system-scroll)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-ssurround text-lg font-bold text-text-heading">일정에 추가</p>
            <p className="mt-4 text-center text-sm font-medium leading-relaxed text-text-primary">
              이 여행 로그를 내 일정으로 가져올까요?
            </p>
            <div className="mt-7 flex w-full gap-3">
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={isImporting}
                className="h-10 flex-1 rounded-lg border border-main-blue font-ssurround text-sm font-bold text-sub-deepblue active:opacity-70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleImportLog}
                disabled={isImporting}
                className="h-10 flex-1 rounded-lg bg-main-blue font-ssurround text-sm font-bold text-main-white active:opacity-70 disabled:opacity-60"
              >
                {isImporting ? "추가 중" : "가져오기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageCard>
  );
}
