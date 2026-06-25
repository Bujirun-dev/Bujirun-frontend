"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.svg";
import { PageCard, FilterChips } from "@/components";
import { LogCard } from "@/features/itinerary";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";

// TODO: API 연결 시 제거 — 실제 페이지당 아이템 수는 백엔드와 협의
const PAGE_SIZE = 5;

const CATEGORIES = ["전체", "바다", "자연", "문화", "체험"] as const;
type Category = typeof CATEGORIES[number];
type SortType = "최신순" | "인기순";

export default function LogsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [sortBy, setSortBy] = useState<SortType>("최신순");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allFiltered = SAMPLE_LOGS
    .filter((log) => selectedCategory === "전체" || log.category === selectedCategory)
    .sort((a, b) =>
      sortBy === "인기순"
        ? b.downloadCount - a.downloadCount
        : b.createdAt.localeCompare(a.createdAt)
    );

  const hasMore = page * PAGE_SIZE < allFiltered.length;
  const visibleLogs = allFiltered.slice(0, page * PAGE_SIZE);

  // 카테고리/정렬 바뀌면 페이지 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [selectedCategory, sortBy]);

  // TODO: API 연결 시 이 함수에서 cursor/page 파라미터로 다음 페이지 요청
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore]);

  // 바닥 감지 → 다음 페이지 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <PageCard>
        {/* 헤더 */}
        <div className="flex items-center gap-4 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center shrink-0"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} style={{ filter: "invert(53%)" }} />
          </button>
          <span className="font-ssurround font-bold text-lg text-text-heading">
            로그 둘러보기
          </span>
        </div>

        {/* 카테고리 칩 */}
        <FilterChips
          options={CATEGORIES}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          className="pb-4 justify-center"
        />

        {/* 정렬 */}
        <div className="flex justify-end items-center gap-2 pb-4">
          <button
            onClick={() => setSortBy("최신순")}
            className={`font-paperlogy text-xs ${
              sortBy === "최신순" ? "font-semibold text-sub-deepblue" : "font-medium text-sub-gray"
            }`}
          >
            최신순
          </button>
          <div className="w-[1px] h-[10px] bg-sub-gray/40" />
          <button
            onClick={() => setSortBy("인기순")}
            className={`font-paperlogy text-xs ${
              sortBy === "인기순" ? "font-semibold text-sub-deepblue" : "font-medium text-sub-gray"
            }`}
          >
            인기순
          </button>
        </div>

        {/* 로그 목록 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-7">
          {visibleLogs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sub-gray font-paperlogy text-sm pt-20">
              해당 카테고리의 로그가 없습니다.
            </div>
          ) : (
            <>
              {visibleLogs.map((log) => (
                <LogCard
                  key={log.id}
                  imageUrl={log.imageUrl}
                  placeName={log.placeName}
                  extraCount={log.extraCount}
                  author={log.author}
                  duration={log.duration}
                  date={log.date}
                  downloadCount={log.downloadCount}
                  onClick={() => router.push(`/itinerary/logs/${log.id}`)}
                />
              ))}
              {/* 무한 스크롤 감지 sentinel */}
              <div ref={sentinelRef} className="h-1 shrink-0" />
              {isLoading && (
                <p className="text-center font-paperlogy text-sm text-sub-gray pb-2">불러오는 중...</p>
              )}
            </>
          )}
        </div>
    </PageCard>
  );
}
