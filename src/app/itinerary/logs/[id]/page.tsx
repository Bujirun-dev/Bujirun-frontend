"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg";
import calendarPlusDarkIcon from "@/assets/icons/itinerary/calendar-plus-dark.png";
import { PageCard, Modal } from "@/components";
import { SAMPLE_LOGS, type DaySchedule, type ScheduleStop } from "@/features/itinerary/data/sampleLogs";

const IMPORT_NAVIGATION_DELAY_MS = 600;

function TagChip({ label, isLight }: { label: string; isLight?: boolean }) {
  return (
    <div
      className={`rounded-md inline-flex items-center justify-center px-1.5 py-1 ${
        isLight ? "bg-category-sea" : "bg-main-blue"
      }`}
    >
      <span
        className={`font-paperlogy font-normal text-xs text-center tracking-[0.16px] ${
          isLight ? "text-text-primary" : "text-white"
        }`}
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
      if (importTimerRef.current) window.clearTimeout(importTimerRef.current);
    };
  }, []);

  if (!log) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray font-paperlogy text-sm">
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
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center shrink-0"
        >
          <Image
            src={angleLeftIcon}
            alt="뒤로"
            width={16}
            height={16}
            style={{ filter: "invert(53%)" }}
          />
        </button>
        <span className="font-ssurround font-bold text-lg text-text-heading flex-1">
          {log.title}
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="size-[28px] rounded-lg bg-system-scroll border-[0.5px] border-main-blue flex items-center justify-center shrink-0"
        >
          <Image src={calendarPlusDarkIcon} alt="일정 추가" width={16} height={16} />
        </button>
      </div>

      {/* 요약 정보 카드 */}
      <div className="shrink-0 mb-5 backdrop-blur-[15px] bg-gradient-to-b from-system-glassfrom to-system-glassto border border-system-glassborder rounded-2xl h-[67px] flex flex-col justify-center px-5 gap-2">
        <div className="flex items-center gap-1">
          <span className="text-md shrink-0">📍</span>
          <span className="font-paperlogy font-medium text-md text-text-primary tracking-[0.28px]">
            {summaryPlace}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm shrink-0">📅</span>
          <span className="font-paperlogy font-medium text-sm text-sub-darkgray tracking-[0.24px]">
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
              <div className="bg-main-blue rounded-lg h-[28px] w-[62px] flex items-center justify-center">
                <span className="font-ssurround font-bold text-md text-white tracking-[0.5px]">
                  day {daySchedule.day}
                </span>
              </div>
              <span className="font-ssurround font-bold text-xs text-sub-gray">
                {daySchedule.date}
              </span>
            </div>

            {/* 타임라인 */}
            <div className="relative flex flex-col pb-1.5">
              {/* 세로 선 */}
              <div
                className="absolute top-[6px] bottom-[6px] w-[2px] bg-sub-lightgray rounded-full"
                style={{ left: "46px", transform: "translateX(-50%)" }}
              />
              {daySchedule.stops.map((stop: ScheduleStop, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start ${idx < daySchedule.stops.length - 1 ? "pb-5" : ""}`}
                >
                  {/* 시간 + 도트 */}
                  <div className="flex items-center shrink-0">
                    <div className="w-10 text-right pr-2.5">
                      <span className="font-paperlogy font-medium text-sm text-sub-deepblue tracking-[0.6px]">
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
                      <span className="font-paperlogy font-medium text-md text-text-primary tracking-[0.42px]">
                        {stop.place}
                      </span>
                    </div>

                    {/* 사진 */}
                    {stop.imageUrl && (
                      <div className="relative w-[254px] h-[118px] rounded-lg overflow-hidden border-[0.3px] border-system-glassborder shrink-0">
                        <Image
                          src={stop.imageUrl}
                          alt={stop.place}
                          fill
                          className="object-cover"
                        />
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
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          if (!isImporting) setShowAddModal(false);
        }}
        icon={
          <div className="size-[52px] rounded-full bg-system-searchbg flex items-center justify-center">
            <Image src={calendarPlusDarkIcon} alt="일정 추가" width={24} height={24} />
          </div>
        }
        title="내 일정에 추가"
        description={`'${log.author}'님의 여행 일정을\n내 일정에 추가하시겠어요?`}
        confirmText={isImporting ? "추가 중" : "추가하기"}
        cancelText="취소"
        confirmVariant="primary"
        onConfirm={() => {
          if (isImporting) return;
          setIsImporting(true);
          importTimerRef.current = window.setTimeout(() => {
            router.replace(`/itinerary?importedLogId=${encodeURIComponent(id)}`);
          }, IMPORT_NAVIGATION_DELAY_MS);
        }}
        onCancel={() => {
          if (!isImporting) setShowAddModal(false);
        }}
      >
        <p className="font-paperlogy font-medium text-sm text-sub-darkgray text-center">
          * 다른 사람의 일정을 불러오면 현재 일정은 사라져요.
        </p>
      </Modal>
    </PageCard>
  );
}
