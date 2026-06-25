"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg";
import calendarPlusDarkIcon from "@/assets/icons/itinerary/calendar-plus-dark.png";
import { PageCard } from "@/components";
import { SAMPLE_LOGS, type DaySchedule, type ScheduleStop } from "@/features/itinerary/data/sampleLogs";

function TagChip({ label, isLight }: { label: string; isLight?: boolean }) {
  return (
    <div
      className={`rounded-[7px] inline-flex items-center justify-center px-[6px] py-[4px] ${
        isLight ? "bg-[rgba(151,193,255,0.5)]" : "bg-main-blue"
      }`}
    >
      <span
        className={`font-paperlogy font-normal text-[11px] text-center tracking-[0.16px] ${
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
  const log = SAMPLE_LOGS.find((l) => l.id === id);

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
      <div className="flex items-center gap-[16px] pb-[18px] shrink-0">
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
        <span className="font-ssurround font-bold text-[16px] text-text-heading flex-1">
          {log.title}
        </span>
        <button className="size-[28px] rounded-[10px] bg-system-scroll border-[0.5px] border-main-blue flex items-center justify-center shrink-0">
          <Image src={calendarPlusDarkIcon} alt="일정 추가" width={16} height={16} />
        </button>
      </div>

      {/* 요약 정보 카드 */}
      <div className="shrink-0 mb-[20px] backdrop-blur-[15px] bg-gradient-to-b from-[rgba(255,255,255,0.52)] to-[rgba(234,244,255,0.39)] border border-[rgba(151,193,255,0.2)] rounded-[20px] h-[67px] flex flex-col justify-center px-[22px] gap-[8px]">
        <div className="flex items-center gap-[5px]">
          <span className="text-[14px] shrink-0">📍</span>
          <span className="font-paperlogy font-medium text-[14px] text-text-primary tracking-[0.28px]">
            {summaryPlace}
          </span>
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="text-[12px] shrink-0">📅</span>
          <span className="font-paperlogy font-medium text-[12px] text-sub-darkgray tracking-[0.24px]">
            {log.duration} · {log.date}
          </span>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-[24px]">
        {log.days.map((daySchedule: DaySchedule) => (
          <div key={daySchedule.day} className="flex flex-col">
            {/* Day 헤더 */}
            <div className="flex items-center gap-[8px] mb-[14px]">
              <div className="bg-main-blue rounded-[10px] h-[28px] w-[62px] flex items-center justify-center">
                <span className="font-ssurround font-bold text-[14px] text-white tracking-[0.5px]">
                  day {daySchedule.day}
                </span>
              </div>
              <span className="font-ssurround font-bold text-[11px] text-sub-gray">
                {daySchedule.date}
              </span>
            </div>

            {/* 타임라인 */}
            <div className="relative flex flex-col pb-[6px]">
              {/* 세로 선 */}
              <div
                className="absolute top-[6px] bottom-[6px] w-[2px] bg-sub-lightgray rounded-full"
                style={{ left: "46px", transform: "translateX(-50%)" }}
              />
              {daySchedule.stops.map((stop: ScheduleStop, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start ${idx < daySchedule.stops.length - 1 ? "pb-[20px]" : ""}`}
                >
                  {/* 시간 + 도트 */}
                  <div className="flex items-center shrink-0">
                    <div className="w-10 text-right pr-[10px]">
                      <span className="font-paperlogy font-medium text-[12px] text-sub-deepblue tracking-[0.6px]">
                        {stop.time}
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-main-blue shrink-0 relative z-10" />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 flex flex-col gap-[10px] pl-[9px]">
                    {/* 장소명 */}
                    <div className="flex items-center gap-[5px]">
                      <span className="text-[14px] shrink-0">📍</span>
                      <span className="font-paperlogy font-medium text-[14px] text-text-primary tracking-[0.42px]">
                        {stop.place}
                      </span>
                    </div>

                    {/* 사진 */}
                    {stop.imageUrl && (
                      <div className="relative w-full aspect-[316/146] rounded-[10px] overflow-hidden border-[0.3px] border-[rgba(151,193,255,0.2)] shrink-0">
                        <Image
                          src={stop.imageUrl}
                          alt={stop.place}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* 태그 */}
                    <div className="flex items-center gap-[5px] flex-wrap">
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
    </PageCard>
  );
}
