"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import MarkerIcon from "@/assets/icons/itinerary/marker.svg?svgr";
import { SearchBar, LoadingState, EmptyState } from "@/components";
import { PlaceSearchItem } from "./PlaceSearchItem";
import { ConsonantIndexBar } from "./ConsonantIndexBar";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import type { Category } from "@/components";
import { cn } from "@/shared/utils";
import { spotApi } from "@/shared/api/domains";
import { getCategoryFromKo } from "@/shared/constants/category";
import type { SpotSearchCategory } from "@/shared/constants/category";
import { FALLBACK_IMAGE } from "@/features/itinerary/utils/scheduleUtils";

type SortOption = "추천순" | "이름순";
type CategoryFilter = SpotSearchCategory | "all";

const SORT_OPTIONS: SortOption[] = ["추천순", "이름순"];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

const CONSONANTS = [
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const CONSONANT_MAP = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const CONSONANT_NORMALIZE: Record<string, string> = {
  ㄲ: "ㄱ",
  ㄸ: "ㄷ",
  ㅃ: "ㅂ",
  ㅆ: "ㅅ",
  ㅉ: "ㅈ",
};

function getInitial(name: string): string {
  const code = name.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return name[0];
  const raw = CONSONANT_MAP[Math.floor((code - 0xac00) / 28 / 21)];
  return CONSONANT_NORMALIZE[raw] ?? raw;
}

export type SearchPlace = {
  id: string;
  name: string;
  category: Category;
  status: "uncollected" | "completed";
  imageUrl: string;
};

interface PlaceSearchPanelProps {
  onClose?: () => void;
  onPlaceSelect?: (place: SearchPlace) => void;
}

export function PlaceSearchPanel({ onClose, onPlaceSelect }: PlaceSearchPanelProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("추천순");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (sortBy !== "이름순") return;
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const consonant = (e.target as HTMLElement).dataset.consonant;
            if (consonant) setActiveSection(consonant);
          }
        });
      },
      { root: list, threshold: 0.5 },
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sortBy]);

  const debouncedSearchValue = useDebouncedValue(searchValue, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: spotApi.keys.search({
      keyword: debouncedSearchValue || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      sort: sortBy === "추천순" ? "RECOMMEND" : "NAME",
    }),
    queryFn: () =>
      spotApi.searchSpots({
        keyword: debouncedSearchValue || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        sort: sortBy === "추천순" ? "RECOMMEND" : "NAME",
      }),
  });

  const filtered: SearchPlace[] = (searchResults ?? []).map((spot) => ({
    id: spot.spotId ?? spot.name ?? "",
    name: spot.name ?? "이름 미상",
    category: getCategoryFromKo(spot.category ?? ""),
    status: spot.collected ? "completed" : "uncollected",
    imageUrl: spot.thumbnailUrl || FALLBACK_IMAGE,
  }));

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, place) => {
    const initial = getInitial(place.name);
    if (!acc[initial]) acc[initial] = [];
    acc[initial].push(place);
    return acc;
  }, {});

  const activeConsonants = CONSONANTS.filter((c) => grouped[c]);

  const scrollToSection = (consonant: string) => {
    const el = sectionRefs.current[consonant];
    const list = listRef.current;
    if (!el || !list) return;
    setActiveSection(consonant);
    isScrollingRef.current = true;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 700);
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    list.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 검색바 */}
      <div className="pb-3.5">
        <SearchBar
          value={searchValue}
          onChange={(v) => {
            setSearchValue(v);
            if (v) setCategoryFilter("all");
          }}
          placeholder="관광지 검색"
          className="!h-[30px] !w-full !rounded-lg !bg-system-searchbg !py-0"
          inputClassName="!!text-xs !font-normal !text-sub-gray placeholder:!text-sub-gray"
          iconSize={11}
        />
      </div>

      {/* 정렬 + 카테고리 필터 */}
      <div className="flex items-center pb-5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setSortBy(opt);
              if (opt === "이름순") setTimeout(() => scrollToSection("ㄱ"), 0);
            }}
            className={cn(
              "relative rounded-md px-1.5 py-1 text-xs font-medium",
              sortBy === opt ? "bg-system-navbg text-sub-deepblue" : "text-sub-gray",
            )}
          >
            {opt}
            {sortBy === opt && (
              <span className="absolute bottom-0 left-0.5 right-0.5 h-[0.5px] rounded-full bg-sub-deepblue" />
            )}
          </button>
        ))}

        <div className="ml-auto">
          <CategoryFilterDropdown value={categoryFilter} onChange={setCategoryFilter} />
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <LoadingState
          message={debouncedSearchValue ? "검색하는 중이에요" : "관광지 목록을 불러오는 중이에요"}
          className="pb-[30%]"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="검색 결과가 없어요"
          description={
            <>
              <span>&quot;{searchValue}&quot;</span>에 대한 결과를 찾지 못했어요.
              <br />
              관광지 이름을 다시 확인해보세요.
            </>
          }
          className="pb-[30%]"
        />
      ) : sortBy === "추천순" ? (
        <div className="flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden">
          {filtered.map((place) => (
            <PlaceSearchItem
              key={place.id}
              name={place.name}
              category={place.category}
              status={place.status}
              imageUrl={place.imageUrl}
              onClick={() => {
                if (onPlaceSelect) {
                  onPlaceSelect({
                    id: place.id,
                    name: place.name,
                    category: place.category,
                    status: place.status,
                    imageUrl: place.imageUrl,
                  });
                } else {
                  onClose?.();
                  router.push(`/itinerary/place/${place.id}`);
                }
              }}
              className="rounded-2xl border border-system-glassborder shadow-[2px_2px_6px_0px_var(--color-system-glassborder)]"
            />
          ))}
        </div>
      ) : (
        /* 이름순 */
        <div className="flex flex-1 gap-3 overflow-hidden">
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {activeConsonants.map((consonant) => (
              <div
                key={consonant}
                ref={(el) => {
                  sectionRefs.current[consonant] = el;
                }}
                data-consonant={consonant}
              >
                {/* 섹션 헤더 */}
                <div className="mb-3 flex w-full items-center rounded-md bg-system-searchbg py-0.5 pl-1.5">
                  <span className="text-xs font-medium text-sub-deepblue">{consonant}</span>
                </div>
                {/* 아이템 목록 */}
                <div className="pl-1">
                  {grouped[consonant].map((place, idx) => (
                    <div key={place.id}>
                      <button
                        className={cn(
                          "flex w-full items-center gap-1.5 text-left active:opacity-70",
                          idx === 0 ? "pt-0 pb-2.5" : "py-2.5",
                        )}
                        onClick={() => {
                          if (onPlaceSelect) {
                            onPlaceSelect({
                              id: place.id,
                              name: place.name,
                              category: place.category,
                              status: place.status,
                              imageUrl: place.imageUrl,
                            });
                          } else {
                            onClose?.();
                            router.push(`/itinerary/place/${place.id}`);
                          }
                        }}
                      >
                        <MarkerIcon
                          width={12}
                          height={12}
                          className={cn(
                            "shrink-0",
                            place.status === "completed" ? "fill-sub-deepblue" : "fill-sub-pink",
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-normal text-text-primary">
                          {place.name}
                        </span>
                      </button>
                      {idx < grouped[consonant].length - 1 && (
                        <div className="h-[0.3px] w-[calc(100%_-_12px)] bg-sub-lightgray" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mb-0.5" />
              </div>
            ))}
          </div>

          {/* 우측 인덱스바 */}
          <ConsonantIndexBar
            activeConsonants={activeConsonants}
            activeSection={activeSection}
            onSelect={scrollToSection}
          />
        </div>
      )}
    </div>
  );
}
