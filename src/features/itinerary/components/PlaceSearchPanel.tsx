"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components";
import { PlaceSearchItem } from "./PlaceSearchItem";
import type { Category } from "@/components";
import { cn } from "@/shared/utils";
import { CATEGORY_LABEL } from "@/shared/constants/category";

type SortOption = "추천순" | "이름순";
type CategoryFilter = Category | "all";

const SORT_OPTIONS: SortOption[] = ["추천순", "이름순"];

const CATEGORY_OPTIONS: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "all" },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
    label,
    value: value as Category,
  })),
];

const SAMPLE_PLACES = [
  {
    id: "1",
    name: "해운대 해수욕장",
    category: "sea" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/beach2/300/200",
  },
  {
    id: "2",
    name: "감천문화마을",
    category: "culture" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/culture/300/200",
  },
  {
    id: "3",
    name: "금정산",
    category: "nature" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/mountain/300/200",
  },
  {
    id: "4",
    name: "송도해상케이블카",
    category: "experience" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/cable/300/200",
  },
  {
    id: "5",
    name: "광안리 해수욕장",
    category: "sea" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/beach3/300/200",
  },
  {
    id: "6",
    name: "송도 해수욕장",
    category: "sea" as Category,
    status: "uncollected" as const,
    imageUrl: "https://picsum.photos/seed/beach4/300/200",
  },
];

interface PlaceSearchPanelProps {
  onClose?: () => void;
}

export function PlaceSearchPanel({ onClose }: PlaceSearchPanelProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("추천순");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const filtered = SAMPLE_PLACES.filter((p) => {
    const matchesSearch = p.name.includes(searchValue);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 검색바 */}
      <div className="pb-3">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="관광지 검색"
          className="!h-[30px] !w-[243px] !rounded-[10px] !bg-system-searchbg !py-0"
          inputClassName="!font-paperlogy !text-[11px] !font-normal !text-sub-gray placeholder:!text-sub-gray"
          gapClassName="!gap-[3px]"
          iconSize={11}
        />
      </div>

      {/* 정렬 + 카테고리 필터 */}
      <div className="flex items-center gap-3 pb-3">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={cn(
              "relative pb-0.5 font-paperlogy text-xs font-semibold",
              sortBy === opt ? "text-sub-deepblue" : "text-sub-gray",
            )}
          >
            {opt}
            {sortBy === opt && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-sub-deepblue" />
            )}
          </button>
        ))}

        <div className="relative ml-auto">
          <button
            onClick={() => setShowCategoryDropdown((v) => !v)}
            className="flex h-[19px] items-center gap-1 rounded-md border border-main-blue bg-system-navbg px-2 font-paperlogy text-xs text-text-primary"
          >
            {CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label ?? "전체"}
            <svg
              width="6"
              height="4"
              viewBox="0 0 6 4"
              fill="none"
              className={cn("shrink-0 transition-transform", showCategoryDropdown && "rotate-180")}
            >
              <path
                d="M1 1L3 3L5 1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showCategoryDropdown && (
            <div className="absolute right-0 top-[22px] z-10 min-w-[60px] overflow-hidden rounded-lg bg-white shadow-md">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCategoryFilter(opt.value);
                    setShowCategoryDropdown(false);
                  }}
                  className={cn(
                    "block w-full whitespace-nowrap px-3 py-1.5 text-left font-paperlogy text-xs",
                    categoryFilter === opt.value
                      ? "font-semibold text-sub-deepblue"
                      : "text-text-primary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 관광지 목록 */}
      <div className="flex flex-col gap-2.5 overflow-x-hidden overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center pt-10 font-paperlogy text-sm text-sub-gray">
            검색 결과가 없습니다.
          </div>
        ) : (
          filtered.map((place) => (
            <PlaceSearchItem
              key={place.id}
              name={place.name}
              category={place.category}
              status={place.status}
              imageUrl={place.imageUrl}
              onClick={() => router.push(`/itinerary/place/${place.id}`)}
              className="rounded-[15px] border border-sub-lightblue/30 shadow-[2px_2px_6px_0px_rgba(151,193,255,0.15)]"
            />
          ))
        )}
      </div>
    </div>
  );
}
