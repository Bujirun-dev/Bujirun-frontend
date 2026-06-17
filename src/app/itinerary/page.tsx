"use client";

import { CategoryChip, Card } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "pending";

interface PlaceItem {
  type: "place";
  time: string;
  name: string;
  category: Category;
  status: PlaceStatus;
}

interface TransportItem {
  type: "transport";
  mode: string;
  number: string;
  route: string;
  duration: string;
  cost: string;
}

type ItineraryItem = PlaceItem | TransportItem;

const MOCK_ITEMS: ItineraryItem[] = [
  { type: "place", time: "12:00", name: "송도 해수욕장", category: "sea", status: "completed" },
  {
    type: "transport",
    mode: "버스",
    number: "2012",
    route: "송도 해수욕장 → 해운대",
    duration: "20min",
    cost: "₩1,500",
  },
  { type: "place", time: "14:30", name: "송도 해수욕장", category: "culture", status: "pending" },
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
  },
];

function PlaceCard({ item }: { item: PlaceItem }) {
  return (
    <Card variant="white" className="flex gap-3 p-3">
      <div className="h-[95px] w-[120px] shrink-0 overflow-hidden rounded-[12px] bg-system-searchbg">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260"
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-ssurround text-[14px] font-bold text-text-heading whitespace-nowrap">
            📍 {item.name}
          </span>
          <button className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-sub-coral text-white text-[12px]">
            🗑
          </button>
        </div>
        <CategoryChip category={item.category} className="w-fit" />
        <div className="flex justify-end">
          {item.status === "completed" ? (
            <button className="rounded-[10px] bg-sub-gray px-3 py-1.5 font-paperlogy text-[11px] font-medium text-white">
              수집 완료
            </button>
          ) : (
            <button className="rounded-[10px] bg-sub-pink px-3 py-1.5 font-paperlogy text-[11px] font-medium text-white">
              인증하기
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function TransportCard({ item }: { item: TransportItem }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-sub-green px-[18px] py-3">
      <div className="flex h-[36px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-white">
        <span className="font-paperlogy text-[12px] font-semibold text-main-blue">{item.mode}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-paperlogy text-[13px] font-bold text-text-heading">
          {item.number}
        </span>
        <span className="font-paperlogy text-[10px] text-text-primary/70">{item.route}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-paperlogy text-[11px] font-medium text-text-primary">
          ⏱ {item.duration}
        </span>
        <span className="font-paperlogy text-[11px] text-text-primary/70">{item.cost}</span>
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* Day 헤더 */}
        <div className="flex items-center gap-3 px-[24px] pt-5 pb-3">
          <div className="flex h-[30px] items-center rounded-full bg-sub-coral px-4">
            <span className="font-ssurround text-[13px] font-bold text-white">day 1</span>
          </div>
          <span className="flex-1 font-paperlogy text-[13px] font-medium text-text-primary">
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
          <div className="relative flex flex-col gap-2">
            {/* 수직선: time(32) + gap(2) + dot center(6) = 40px */}
            <div className="absolute left-[40px] top-6 bottom-0 w-[2px] bg-sub-lightgray" />

            {/* + 버튼 */}
            <div className="flex items-center">
              <div className="w-[32px] shrink-0" />
              <button className="relative z-10 ml-[2px] flex size-[12px] items-center justify-center rounded-full bg-sub-coral text-[9px] font-bold text-white shadow-sm">
                +
              </button>
            </div>

            {MOCK_ITEMS.map((item, i) => {
              if (item.type === "place") {
                return (
                  <div key={i} className="flex items-start">
                    {/* 시간 */}
                    <span className="w-[32px] shrink-0 pt-[14px] text-right font-paperlogy text-[11px] font-semibold text-main-blue">
                      {item.time}
                    </span>
                    {/* 점: ml-[2px]로 바로 붙임, center = 32+2+6 = 40px */}
                    <div className="relative z-10 ml-[2px] mt-[18px] size-[12px] shrink-0 rounded-full bg-main-blue ring-2 ring-white" />
                    {/* 카드 */}
                    <div className="ml-2 flex-1 min-w-0">
                      <PlaceCard item={item} />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="flex items-center">
                  {/* time(32) + gap(2) + dot(12) = 46px spacer */}
                  <div className="w-[46px] shrink-0" />
                  <div className="ml-2 flex-1 min-w-0">
                    <TransportCard item={item} />
                  </div>
                </div>
              );
            })}
          </div>
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
