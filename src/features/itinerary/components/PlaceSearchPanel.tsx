"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import triangleIcon from "@/assets/icons/itinerary/triangle.png";
import markerBlueIcon from "@/assets/icons/itinerary/marker-blue.png";
import markerPinkIcon from "@/assets/icons/itinerary/marker-pink.png";
import { SearchBar } from "@/components";
import { PlaceSearchItem } from "./PlaceSearchItem";
import { CategoryChip } from "@/components";
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
  { id: "1", name: "해운대 해수욕장", category: "sea" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/beach2/300/200" },
  { id: "2", name: "감천문화마을", category: "culture" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/culture/300/200" },
  { id: "3", name: "금정산", category: "nature" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/mountain/300/200" },
  { id: "4", name: "송도해상케이블카", category: "experience" as Category, status: "completed" as const, imageUrl: "https://picsum.photos/seed/cable/300/200" },
  { id: "5", name: "광안리 해수욕장", category: "sea" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/beach3/300/200" },
  { id: "6", name: "송도 해수욕장", category: "sea" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/beach4/300/200" },
  { id: "7", name: "낙동강 하구 에코센터", category: "nature" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/eco/300/200" },
  { id: "8", name: "남포동 거리", category: "culture" as Category, status: "completed" as const, imageUrl: "https://picsum.photos/seed/nampo/300/200" },
  { id: "9", name: "다대포 해수욕장", category: "sea" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/dadaepo/300/200" },
  { id: "10", name: "민락 수변 공원", category: "nature" as Category, status: "uncollected" as const, imageUrl: "https://picsum.photos/seed/minlak/300/200" },
];

const CONSONANTS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const CONSONANT_MAP = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const CONSONANT_NORMALIZE: Record<string, string> = { "ㄲ": "ㄱ", "ㄸ": "ㄷ", "ㅃ": "ㅂ", "ㅆ": "ㅅ", "ㅉ": "ㅈ" };

function getInitial(name: string): string {
  const code = name.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return name[0];
  const raw = CONSONANT_MAP[Math.floor((code - 0xac00) / 28 / 21)];
  return CONSONANT_NORMALIZE[raw] ?? raw;
}

interface PlaceSearchPanelProps {
  onClose?: () => void;
}

export function PlaceSearchPanel({ onClose }: PlaceSearchPanelProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("추천순");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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

  const filtered = SAMPLE_PLACES.filter((p) => {
    const matchesSearch = p.name.includes(searchValue);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
    setTimeout(() => { isScrollingRef.current = false; }, 700);
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    list.scrollTo({ top, behavior: "smooth" });
  };

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
      <div className="flex items-center gap-0 pb-[35px]">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={cn(
              "relative px-[6px] py-[3px] font-paperlogy text-[11px] font-medium rounded-md",
              sortBy === opt ? "text-sub-deepblue bg-system-navbg" : "text-sub-gray",
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
            <div
              className="absolute right-0 top-[22px] z-10 w-full overflow-hidden rounded-lg bg-white shadow-md py-[5px] px-[3px]"
              style={{ border: "0.5px solid var(--color-main-blue)" }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setCategoryFilter(opt.value); setShowCategoryDropdown(false); }}
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

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center pt-10 font-paperlogy text-sm text-sub-gray">
          검색 결과가 없습니다.
        </div>
      ) : sortBy === "추천순" ? (
        <div className="flex flex-col gap-2.5 overflow-x-hidden overflow-y-auto">
          {filtered.map((place) => (
            <PlaceSearchItem
              key={place.id}
              name={place.name}
              category={place.category}
              status={place.status}
              imageUrl={place.imageUrl}
              onClick={() => router.push(`/itinerary/place/${place.id}`)}
              className="rounded-[15px] border border-sub-lightblue/30 shadow-[2px_2px_6px_0px_rgba(151,193,255,0.15)]"
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
                ref={(el) => { sectionRefs.current[consonant] = el; }}
              data-consonant={consonant}
              >
                {/* 섹션 헤더 */}
                <div className="mb-2 flex w-full items-center rounded-[5px] bg-system-searchbg py-[2px] pl-[6px]">
                  <span className="font-paperlogy text-[11px] font-medium text-sub-deepblue">{consonant}</span>
                </div>
                {/* 아이템 목록 */}
                {grouped[consonant].map((place, idx) => (
                  <div key={place.id}>
                    <button
                      className="flex w-full items-center gap-[6px] py-2 text-left active:opacity-70"
                      onClick={() => router.push(`/itinerary/place/${place.id}`)}
                    >
                      <Image
                        src={place.status === "completed" ? markerBlueIcon : markerPinkIcon}
                        alt="위치"
                        width={12}
                        height={12}
                        className="shrink-0"
                      />
                      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
                        <span className="min-w-0 font-paperlogy text-[12px] font-normal text-text-primary truncate">
                          {place.name}
                        </span>
                        <CategoryChip category={place.category} />
                      </div>
                    </button>
                    {idx < grouped[consonant].length - 1 && (
                      <div style={{ height: "0.3px", backgroundColor: "var(--color-sub-lightgray)", width: "calc(100% - 12px)" }} />
                    )}
                  </div>
                ))}
                <div className="mb-2" />
              </div>
            ))}
          </div>

          {/* 우측 인덱스바 */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-1 rounded-[5px] bg-system-navbg px-[4px] py-[3px] self-start">
            <span className="font-paperlogy text-[11px] font-medium leading-none text-sub-deepblue">#</span>
            {CONSONANTS.map((c) => (
              <button
                key={c}
                onClick={(e) => { e.stopPropagation(); scrollToSection(c); }}
                className={cn(
                  "flex w-[14px] items-center justify-center py-[1px] rounded-md font-paperlogy text-[11px] leading-none transition-colors",
                  activeSection === c
                    ? "bg-main-blue font-medium text-white"
                    : activeConsonants.includes(c)
                      ? "font-medium text-sub-deepblue"
                      : "font-medium text-sub-lightgray",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
