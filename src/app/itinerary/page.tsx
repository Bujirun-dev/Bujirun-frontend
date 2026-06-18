"use client";

import { ItineraryTimeline } from "@/features/itinerary";
import type { ItineraryItem } from "@/features/itinerary";

const MOCK_ITEMS: ItineraryItem[] = [
  {
    type: "place",
    time: "12:00",
    name: "송도 해수욕장",
    category: "sea",
    status: "completed",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260",
  },
  {
    type: "transport",
    mode: "버스",
    number: "2012",
    route: "송도 해수욕장 → 해운대",
    duration: "20min",
    cost: "₩1,500",
  },
  {
    type: "place",
    time: "14:30",
    name: "송도 해수욕장",
    category: "culture",
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260",
  },
  {
    type: "transport",
    mode: "버스",
    number: "2012",
    route: "송도 해수욕장 → 해운대",
    duration: "20min",
    cost: "₩1,500",
  },
  {
    type: "place",
    time: "18:30",
    name: "송도 해수욕장",
    category: "experience",
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260",
  },
];

export default function ItineraryPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* Day 헤더 */}
        <div className="flex items-center gap-3 px-[24px] pt-5 pb-3">
          <div className="flex h-[30px] items-center rounded-full bg-sub-coral px-4">
            <span className="font-ssurround text-md font-bold text-white">day 1</span>
          </div>
          <span className="flex-1 font-paperlogy text-md font-medium text-text-primary">
            2026.05.18
          </span>
          <button className="flex size-[34px] items-center justify-center rounded-[10px] bg-system-navbg text-[17px]">
            🗺
          </button>
          <button className="flex size-[34px] items-center justify-center rounded-[10px] bg-system-navbg text-[17px]">
            ✨
          </button>
        </div>

        {/* 타임라인 */}
        <div className="flex-1 overflow-y-auto pl-[12px] pr-[24px] pb-6">
          <ItineraryTimeline items={MOCK_ITEMS} onAddPlace={() => {}} />
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="flex size-[22px] items-center justify-center rounded-full bg-main-blue">
            <span className="font-paperlogy text-[10px] font-bold text-white">1</span>
          </div>
          <div className="size-[8px] rounded-full bg-main-blue/30" />
          <div className="size-[8px] rounded-full bg-main-blue/30" />
        </div>
      </div>
    </div>
  );
}
