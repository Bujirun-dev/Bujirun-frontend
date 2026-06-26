"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import triangleIcon from "@/assets/icons/itinerary/triangle.png";
import { SearchBar } from "@/components";
import { PlaceSearchItem } from "./PlaceSearchItem";
import type { Category } from "@/components";
import { cn } from "@/shared/utils";
import { CATEGORY_LABEL } from "@/shared/constants/category";

type SortOption = "추천순" | "이름순";
type CategoryFilter = Category | "all";

const SORT_OPTIONS: SortOption[] = ["추천순", "이름순"];

const CATEGORY_EMOJI: Record<string, string> = {
  all: "⭐",
  sea: "🌊",
  nature: "🌿",
  culture: "🏛",
  experience: "🎡",
};

const CATEGORY_OPTIONS: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "all" },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
    label: label.replace("#", ""),
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
      <div className="pb-[14px]">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="관광지 검색"
          className="!w-full !rounded-[10px] !bg-system-searchbg !h-[30px] !py-0"
          inputClassName="!font-paperlogy !text-[11px] !font-normal !text-sub-gray placeholder:!text-sub-gray"
          gapClassName="!gap-[3px]"
          iconSize={11}
        />
      </div>

      {/* 정렬 + 카테고리 필터 */}
      <div className="flex items-center gap-0 pb-3">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={cn(
              "relative px-[6px] py-[3px] font-paperlogy text-[11px] font-medium rounded-md",
              sortBy === opt
                ? "text-sub-deepblue bg-system-navbg"
                : "text-sub-gray",
            )}
          >
            {opt}
            {sortBy === opt && (
              <span className="absolute bottom-0 left-0 right-0 h-[0.5px] rounded-full bg-sub-deepblue" />
            )}
          </button>
        ))}

        <div className="relative ml-auto">
          <button
            onClick={() => setShowCategoryDropdown((v) => !v)}
            className="flex h-[19px] items-center gap-[14px] rounded-[7px] bg-system-navbg pl-[15px] pr-[6px] font-paperlogy text-[11px] font-normal text-text-primary"
            style={{ border: "0.5px solid var(--color-main-blue)" }}
          >
            {CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label ?? "전체"}
            <Image
              src={triangleIcon}
              alt="드롭다운"
              width={6}
              height={6}
              className={cn("shrink-0 transition-transform", showCategoryDropdown && "rotate-180")}
            />
          </button>

          {showCategoryDropdown && (
            <div className="absolute right-0 top-[22px] z-10 w-full overflow-hidden rounded-lg bg-white shadow-md py-[5px] px-[3px]" style={{ border: "0.5px solid var(--color-main-blue)" }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCategoryFilter(opt.value);
                    setShowCategoryDropdown(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-1.5 whitespace-nowrap py-[3px] text-left font-paperlogy text-[11px]",
                    categoryFilter === opt.value
                      ? "rounded-[5px] bg-system-navbg font-semibold px-2"
                      : "text-text-primary px-2",
                  )}
                  style={categoryFilter === opt.value ? { border: "0.5px solid var(--color-main-blue)" } : undefined}
                >
                  <span>{CATEGORY_EMOJI[opt.value]}</span>
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
