"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import friendsIcon from "@/assets/icons/itinerary/friends.png";
import checkIcon from "@/assets/icons/itinerary/check.png";
import { Button, PageCard } from "@/components";

const SAMPLE_TRIPS = [
  { id: "1", name: "부지런즈 부산 여행", startDate: "2026.05.18", endDate: "2026.05.20", memberCount: 4, isActive: true },
  { id: "2", name: "혼자 제주도", startDate: "2026.03.10", endDate: "2026.03.12", memberCount: 1, isActive: false },
];

export default function LogAddConfirmPage() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedTrip) return;
    router.push("/itinerary");
  };

  return (
    <PageCard>
        {/* 헤더 */}
        <div className="flex items-center gap-3 pt-5 pb-5">
          <button
            onClick={() => router.back()}
            className="size-[28px] rounded-[10px] bg-[#d5e6ff] flex items-center justify-center shrink-0"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
          </button>
          <span className="flex-1 text-center font-paperlogy font-bold text-base text-text-heading">
            내 일정에 추가
          </span>
          <div className="size-[28px]" />
        </div>

        {/* 로그 요약 */}
        <div className="mb-5 rounded-[15px] bg-system-searchbg px-4 py-3 flex flex-col gap-1">
          <p className="font-paperlogy font-bold text-[14px] text-text-heading">해운대 해수욕장 외 3곳</p>
          <p className="font-paperlogy text-[12px] text-sub-gray">by 여행자123 · 바다 · 2026.05.10 ~ 05.12</p>
        </div>

        {/* 여행 선택 */}
        <div className="app-scrollbar flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden pb-6">
          <p className="font-paperlogy text-[13px] text-text-primary font-semibold mb-1">
            추가할 여행을 선택해주세요
          </p>
          {SAMPLE_TRIPS.map((trip) => {
            const isSelected = selectedTrip === trip.id;
            return (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(trip.id)}
                className={`w-full rounded-[15px] border px-4 py-3.5 flex items-center justify-between text-left transition-colors ${
                  isSelected
                    ? "border-main-blue bg-[#e8f3ff]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-paperlogy font-bold text-[14px] text-text-heading">
                      {trip.name}
                    </span>
                    {trip.isActive && (
                      <span className="bg-main-blue text-white text-[9px] font-paperlogy font-semibold px-1.5 py-0.5 rounded-full">
                        진행 중
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-paperlogy text-[11px] text-sub-gray">
                      <Image src={calendarIcon} alt="날짜" width={11} height={11} />
                      {trip.startDate} ~ {trip.endDate}
                    </span>
                    <span className="flex items-center gap-1 font-paperlogy text-[11px] text-sub-gray">
                      <Image src={friendsIcon} alt="인원" width={11} height={11} />
                      {trip.memberCount}명
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="size-[22px] rounded-full bg-main-blue flex items-center justify-center shrink-0">
                    <Image src={checkIcon} alt="선택됨" width={12} height={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="pb-6 pt-3 shrink-0">
          <Button
            variant="primary"
            onClick={handleConfirm}
            className={!selectedTrip ? "opacity-50 pointer-events-none" : ""}
          >
            추가하기
          </Button>
        </div>
    </PageCard>
  );
}
