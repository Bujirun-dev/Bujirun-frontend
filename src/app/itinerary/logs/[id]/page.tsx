"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import downloadBlueIcon from "@/assets/icons/collection/download-blue.png";
import friendsIcon from "@/assets/icons/itinerary/friends.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import markerIcon from "@/assets/icons/itinerary/marker-pink.png";
import clockIcon from "@/assets/icons/itinerary/clock-blue.png";
import { Button, CategoryChip, type Category } from "@/components";

interface ScheduleStop {
  time: string;
  place: string;
  category: Category;
  tags: string[];
}

const SAMPLE_SCHEDULE: ScheduleStop[] = [
  { time: "10:00", place: "해운대 해수욕장", category: "sea", tags: ["#해변", "#여름", "#부산"] },
  { time: "12:30", place: "해운대 시장", category: "culture", tags: ["#맛집", "#로컬푸드"] },
  { time: "14:00", place: "동백섬", category: "nature", tags: ["#산책", "#바다뷰"] },
  { time: "17:00", place: "광안리 해수욕장", category: "sea", tags: ["#일몰", "#야경"] },
];

export default function LogDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* 대표 이미지 */}
        <div className="relative w-full h-[220px] shrink-0">
          <Image
            src={`https://picsum.photos/seed/log${params.id}/400/300`}
            alt="로그 대표 이미지"
            fill
            className="object-cover"
          />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 size-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 정보 섹션 */}
          <div className="px-5 pt-4 pb-3 flex flex-col gap-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-paperlogy font-bold text-[18px] text-text-heading leading-snug">
                해운대 해수욕장 외 3곳
              </h1>
              <div className="flex items-center gap-1 bg-system-searchbg rounded-[8px] px-2 py-1 shrink-0">
                <Image src={downloadBlueIcon} alt="추가 횟수" width={11} height={11} />
                <span className="font-paperlogy text-[11px] text-sub-gray">34</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="font-paperlogy text-[13px] text-text-primary flex items-center gap-1.5">
                <Image src={friendsIcon} alt="작성자" width={13} height={13} className="shrink-0" />
                여행자123
              </p>
              <p className="font-paperlogy text-[13px] text-sub-gray flex items-center gap-1.5">
                <Image src={calendarIcon} alt="날짜" width={13} height={13} className="shrink-0" />
                바다 · 2026.05.10 ~ 05.12
              </p>
            </div>
          </div>

          {/* 상세 일정 섹션 */}
          <div className="px-5 pt-4 pb-6">
            <h2 className="font-paperlogy font-bold text-[15px] text-text-heading mb-4">상세 일정</h2>

            <div className="relative">
              {/* 수직선 */}
              <div className="absolute left-[42px] top-3 bottom-3 w-[1.5px] bg-main-blue/30" />

              <div className="flex flex-col gap-0">
                {SAMPLE_SCHEDULE.map((stop, idx) => (
                  <div key={idx} className="flex gap-3 items-start pb-6 last:pb-0">
                    {/* 시간 */}
                    <div className="flex items-center gap-1 w-[42px] shrink-0 pt-[2px]">
                      <Image src={clockIcon} alt="시간" width={11} height={11} className="shrink-0" />
                      <span className="font-paperlogy text-[10px] text-sub-deepblue font-semibold leading-none">
                        {stop.time}
                      </span>
                    </div>

                    {/* 도트 */}
                    <div className="size-[10px] rounded-full bg-main-blue shrink-0 mt-[3px] z-10" />

                    {/* 내용 */}
                    <div className="flex-1 flex flex-col gap-1.5 pl-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-paperlogy font-semibold text-[14px] text-text-heading flex items-center gap-1">
                          <Image src={markerIcon} alt="위치" width={12} height={12} className="shrink-0" />
                          {stop.place}
                        </span>
                        <CategoryChip category={stop.category} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {stop.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-paperlogy text-[11px] text-sub-deepblue bg-[#e8f3ff] rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 pb-6 pt-3 shrink-0">
          <Button
            variant="primary"
            onClick={() => router.push(`/itinerary/logs/${params.id}/add`)}
          >
            내 일정에 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
