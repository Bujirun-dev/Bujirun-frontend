"use client";

import { FeaturePlaceholder } from "@/components";

export default function ItineraryPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
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

        <div className="flex-1 overflow-y-auto pl-[12px] pr-[24px] pb-6">
          <FeaturePlaceholder />
        </div>

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
