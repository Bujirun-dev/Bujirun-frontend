"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import { PageCard, FilterChips } from "@/components";
import { LogCard } from "@/features/itinerary";

const SAMPLE_LOGS = [
  { id: "1", imageUrl: "https://picsum.photos/seed/log1/400/300", placeName: "해운대 해수욕장", extraCount: 2, author: "여행자123", tripType: "바다", date: "2026.05.10 ~ 05.12", downloadCount: 34, category: "바다" },
  { id: "2", imageUrl: "https://picsum.photos/seed/log2/400/300", placeName: "경복궁", extraCount: 1, author: "여행러버", tripType: "문화", date: "2026.05.08 ~ 05.09", downloadCount: 12, category: "문화" },
  { id: "3", imageUrl: "https://picsum.photos/seed/log3/400/300", placeName: "한라산", extraCount: 0, author: "트레커", tripType: "자연", date: "2026.05.01 ~ 05.03", downloadCount: 8, category: "자연" },
  { id: "4", imageUrl: "https://picsum.photos/seed/log4/400/300", placeName: "에버랜드", extraCount: 3, author: "테마파크매니아", tripType: "체험", date: "2026.04.20 ~ 04.21", downloadCount: 56, category: "체험" },
  { id: "5", imageUrl: "https://picsum.photos/seed/log5/400/300", placeName: "광안리 해수욕장", extraCount: 1, author: "바다사랑", tripType: "바다", date: "2026.04.15 ~ 04.17", downloadCount: 21, category: "바다" },
];

const CATEGORIES = ["전체", "바다", "자연", "문화", "체험"] as const;
type Category = typeof CATEGORIES[number];
type SortType = "최신순" | "인기순";

export default function LogsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [sortBy, setSortBy] = useState<SortType>("최신순");

  const filtered = SAMPLE_LOGS
    .filter((log) => selectedCategory === "전체" || log.category === selectedCategory)
    .sort((a, b) => sortBy === "인기순" ? b.downloadCount - a.downloadCount : 0);

  return (
    <PageCard>
        {/* 헤더 */}
        <div className="flex items-center gap-3 pt-5 pb-4">
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

        {/* 카테고리 칩 */}
        <FilterChips
          options={CATEGORIES}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          className="pb-3 justify-center"
        />

        {/* 정렬 */}
        <div className="flex justify-end items-center gap-2 pb-4">
          <button
            onClick={() => setSortBy("최신순")}
            className={`font-paperlogy text-[12px] font-semibold ${
              sortBy === "최신순" ? "text-sub-deepblue" : "text-sub-gray"
            }`}
          >
            최신순
          </button>
          <div className="w-[1px] h-[10px] bg-sub-gray/40" />
          <button
            onClick={() => setSortBy("인기순")}
            className={`font-paperlogy text-[12px] font-semibold ${
              sortBy === "인기순" ? "text-sub-deepblue" : "text-sub-gray"
            }`}
          >
            인기순
          </button>
        </div>

        {/* 로그 목록 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sub-gray font-paperlogy text-sm pt-20">
              해당 카테고리의 로그가 없습니다.
            </div>
          ) : (
            filtered.map((log) => (
              <LogCard
                key={log.id}
                imageUrl={log.imageUrl}
                placeName={log.placeName}
                extraCount={log.extraCount}
                author={log.author}
                tripType={log.tripType}
                date={log.date}
                downloadCount={log.downloadCount}
                onClick={() => router.push(`/itinerary/logs/${log.id}`)}
              />
            ))
          )}
        </div>
    </PageCard>
  );
}
