"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/shared/utils";
import type { Category } from "@/components/ui/CategoryChip";
import { getCategoryLabel } from "@/shared/constants/category";

const CATEGORY_BG: Record<Category, string> = {
  sea: "bg-category-sea",
  nature: "bg-category-nature",
  culture: "bg-category-culture",
  experience: "bg-category-experience",
};

export interface LogDetailStop {
  time: string;
  place: string;
  imageUrl?: string | StaticImageData;
  category: Category;
  tags: string[];
}

export interface LogDetailDay {
  day: number;
  date: string;
  stops: LogDetailStop[];
}

export interface LogDetailData {
  title: string;
  placeName: string;
  extraCount?: number;
  duration: string;
  date: string;
  days: LogDetailDay[];
}

interface LogDetailContentProps {
  log: LogDetailData;
  onBack?: () => void;
  /** itinerary의 "일정에 담기" 버튼, collection의 공개/비공개 스위치 등 헤더 우측 슬롯 */
  headerRight?: ReactNode;
}

export function LogDetailContent({ log, onBack, headerRight }: LogDetailContentProps) {
  const summaryPlace =
    log.extraCount && log.extraCount > 0 ? `${log.placeName} 외 ${log.extraCount}곳` : log.placeName;

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center gap-4 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={onBack} />
        <span className="font-ssurround font-bold text-lg text-text-heading flex-1 truncate">
          {log.title}
        </span>
        {headerRight}
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
        {log.days.map((daySchedule) => (
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
              <div className="absolute top-[6px] bottom-[6px] left-[45px] w-[2px] bg-sub-lightgray rounded-full" />
              {daySchedule.stops.map((stop, idx) => (
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
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-1.5 py-1",
                          CATEGORY_BG[stop.category],
                        )}
                      >
                        <span className="text-center text-xs text-text-primary tracking-[0.16px]">
                          {getCategoryLabel(stop.category)}
                        </span>
                      </span>
                      {stop.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center rounded-md bg-main-blue px-1.5 py-1"
                        >
                          <span className="text-center text-xs text-main-white tracking-[0.16px]">
                            {tag}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DayBadge({ day }: { day: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-main-blue px-2.5 pt-1.5 pb-1 shrink-0">
      <span className="font-ssurround font-bold text-md text-main-white tracking-[0.5px] leading-none">
        day {day}
      </span>
    </div>
  );
}
