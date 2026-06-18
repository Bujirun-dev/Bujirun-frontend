"use client";

import { CategoryChip, Card } from "@/components";
import type { Category } from "@/components";

type PlaceStatus = "completed" | "pending";

export interface ItineraryPlaceItem {
  type: "place";
  time: string;
  name: string;
  category: Category;
  status: PlaceStatus;
  imageUrl?: string;
  onDelete?: () => void;
  onClick?: () => void;
}

export interface ItineraryTransportItem {
  type: "transport";
  mode: string;
  number: string;
  route: string;
  duration: string;
  cost: string;
}

export type ItineraryItem = ItineraryPlaceItem | ItineraryTransportItem;

interface ItineraryTimelineProps {
  items: ItineraryItem[];
  onAddPlace?: () => void;
}

function PlaceRow({ item }: { item: ItineraryPlaceItem }) {
  return (
    <Card variant="white" className="flex gap-3 p-3">
      <div className="h-[95px] w-[120px] shrink-0 overflow-hidden rounded-[12px] bg-system-searchbg">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-ssurround text-md font-bold text-text-heading whitespace-nowrap">
            📍 {item.name}
          </span>
          <button
            onClick={item.onDelete}
            className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-sub-coral text-white text-sm"
          >
            🗑
          </button>
        </div>
        <CategoryChip category={item.category} className="w-fit" />
        <div className="flex justify-end">
          {item.status === "completed" ? (
            <button className="rounded-[10px] bg-main-blue px-3 py-1.5 font-paperlogy text-xs font-medium text-white">
              수집 완료
            </button>
          ) : (
            <button
              onClick={item.onClick}
              className="rounded-[10px] bg-sub-pink px-3 py-1.5 font-paperlogy text-xs font-medium text-white"
            >
              인증하기
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function TransportRow({ item }: { item: ItineraryTransportItem }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-sub-green px-[18px] py-3">
      <div className="flex h-[36px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-white">
        <span className="font-paperlogy text-sm font-semibold text-main-blue">{item.mode}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-paperlogy text-md font-bold text-text-heading">{item.number}</span>
        <span className="font-paperlogy text-[10px] text-text-primary/70">{item.route}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-paperlogy text-xs font-medium text-text-primary">⏱ {item.duration}</span>
        <span className="font-paperlogy text-xs text-text-primary/70">{item.cost}</span>
      </div>
    </div>
  );
}

export function ItineraryTimeline({ items, onAddPlace }: ItineraryTimelineProps) {
  return (
    <div className="relative flex flex-col gap-2">
      {/* 수직선 */}
      <div className="absolute left-[40px] top-6 bottom-0 w-[2px] bg-sub-lightgray" />

      {/* + 버튼 */}
      <div className="flex items-center">
        <div className="w-[32px] shrink-0" />
        <button
          onClick={onAddPlace}
          className="relative z-10 ml-[2px] flex size-[12px] items-center justify-center rounded-full bg-sub-coral text-xs font-bold text-white shadow-sm"
        >
          +
        </button>
      </div>

      {items.map((item, i) => {
        if (item.type === "place") {
          return (
            <div key={i} className="flex items-start">
              <span className="w-[32px] shrink-0 pt-[14px] text-right font-paperlogy text-xs font-semibold text-main-blue">
                {item.time}
              </span>
              <div className="relative z-10 ml-[2px] mt-[18px] size-[12px] shrink-0 rounded-full bg-main-blue ring-2 ring-white" />
              <div className="ml-2 flex-1 min-w-0">
                <PlaceRow item={item} />
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="flex items-center">
            <div className="w-[46px] shrink-0" />
            <div className="ml-2 flex-1 min-w-0">
              <TransportRow item={item} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
