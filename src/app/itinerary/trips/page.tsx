"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import calendarIcon from "@/assets/icons/itinerary/calendar.png";
import friendsIcon from "@/assets/icons/itinerary/friends.png";
import { Button } from "@/components";

const SAMPLE_TRIPS = [
  { id: "1", name: "부지런즈 부산 여행", startDate: "2026.05.18", endDate: "2026.05.20", memberCount: 4, isActive: true },
  { id: "2", name: "혼자 제주도", startDate: "2026.03.10", endDate: "2026.03.12", memberCount: 1, isActive: false },
  { id: "3", name: "가족 경주 여행", startDate: "2026.01.05", endDate: "2026.01.07", memberCount: 5, isActive: false },
];

export default function TripsPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-5">
          <button
            onClick={() => router.back()}
            className="size-[28px] rounded-[10px] bg-[#d5e6ff] flex items-center justify-center shrink-0"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
          </button>
          <span className="flex-1 text-center font-paperlogy font-bold text-base text-text-heading">
            여행 목록
          </span>
          <div className="size-[28px]" />
        </div>

        {/* 여행 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3">
          {SAMPLE_TRIPS.map((trip) => (
            <button
              key={trip.id}
              className="w-full bg-white/80 border border-main-blue/20 rounded-[20px] px-5 py-4 flex flex-col gap-2 shadow-sm active:opacity-80 text-left"
              onClick={() => router.push("/itinerary")}
            >
              <div className="flex items-center justify-between">
                <span className="font-paperlogy font-bold text-md text-text-heading">{trip.name}</span>
                {trip.isActive && (
                  <span className="bg-main-blue text-white text-[10px] font-paperlogy font-semibold px-2 py-0.5 rounded-full">
                    진행 중
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-paperlogy text-xs text-sub-gray">
                  <Image src={calendarIcon} alt="날짜" width={12} height={12} />
                  {trip.startDate} ~ {trip.endDate}
                </span>
                <span className="flex items-center gap-1 font-paperlogy text-xs text-sub-gray">
                  <Image src={friendsIcon} alt="인원" width={12} height={12} />
                  {trip.memberCount}명
                </span>
              </div>
            </button>
          ))}

          <Button
            variant="primary"
            className="mt-2"
            onClick={() => {}}
          >
            + 새 여행 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
