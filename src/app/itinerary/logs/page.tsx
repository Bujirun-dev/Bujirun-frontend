"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import { SearchBar } from "@/components";
import { LogCard } from "@/features/itinerary";

const SAMPLE_LOGS = [
  { id: "1", imageUrl: "https://picsum.photos/seed/log1/400/300", placeName: "해운대 해수욕장", extraCount: 2, author: "여행자123", tripType: "바다", date: "2026.05.10", dDay: 5 },
  { id: "2", imageUrl: "https://picsum.photos/seed/log2/400/300", placeName: "경복궁", extraCount: 1, author: "여행러버", tripType: "문화", date: "2026.05.08", dDay: 12 },
  { id: "3", imageUrl: "https://picsum.photos/seed/log3/400/300", placeName: "한라산", extraCount: 0, author: "트레커", tripType: "자연", date: "2026.05.01", dDay: 20 },
];

const CATEGORIES = ["전체", "바다", "자연", "문화", "체험"] as const;

export default function LogsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-white">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <button
            onClick={() => router.back()}
            className="size-[28px] rounded-[10px] bg-[#d5e6ff] flex items-center justify-center shrink-0"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
          </button>
          <span className="flex-1 text-center font-paperlogy font-bold text-base text-text-heading">
            로그 둘러보기
          </span>
          <div className="size-[28px]" />
        </div>

        {/* 검색 */}
        <div className="px-5 pb-3">
          <SearchBar value={searchValue} onChange={setSearchValue} placeholder="로그 검색" />
        </div>

        {/* 카테고리 */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 h-[28px] px-3 rounded-full font-paperlogy text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-main-blue text-white"
                  : "bg-system-searchbg text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 로그 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4">
          {SAMPLE_LOGS.map((log) => (
            <LogCard key={log.id} {...log} onClick={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}
