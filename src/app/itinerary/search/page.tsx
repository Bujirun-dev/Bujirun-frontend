"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import angleLeftIcon from "@/assets/icons/itinerary/angle-left.png";
import { PageCard, SearchBar } from "@/components";
import { PlaceSearchItem } from "@/features/itinerary";

const SAMPLE_PLACES = [
  { id: "1", name: "해운대 해수욕장", category: "sea" as const, status: "completed" as const, imageUrl: "https://picsum.photos/seed/beach2/300/200" },
  { id: "2", name: "감천문화마을", category: "culture" as const, status: "verify" as const, imageUrl: "https://picsum.photos/seed/culture/300/200" },
  { id: "3", name: "금정산", category: "nature" as const, imageUrl: "https://picsum.photos/seed/mountain/300/200" },
  { id: "4", name: "송도해상케이블카", category: "experience" as const, imageUrl: "https://picsum.photos/seed/cable/300/200" },
  { id: "5", name: "광안리 해수욕장", category: "sea" as const, status: "verify" as const, imageUrl: "https://picsum.photos/seed/beach3/300/200" },
];

const SORT_OPTIONS = ["추천순", "이름순"] as const;

export default function PlaceSearchPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<"추천순" | "이름순">("추천순");

  const filtered = SAMPLE_PLACES.filter((p) =>
    p.name.includes(searchValue)
  );

  return (
    <PageCard>
        {/* 헤더 */}
        <div className="flex items-center gap-3 pb-3">
          <button
            onClick={() => router.back()}
            className="size-[28px] rounded-[10px] bg-[#d5e6ff] flex items-center justify-center shrink-0"
          >
            <Image src={angleLeftIcon} alt="뒤로" width={16} height={16} />
          </button>
          <div className="flex-1">
            <SearchBar value={searchValue} onChange={setSearchValue} placeholder="관광지 검색" />
          </div>
        </div>

        {/* 정렬 */}
        <div className="flex gap-2 pb-3">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`h-[26px] px-3 rounded-full font-paperlogy text-xs font-semibold transition-colors ${
                sortBy === opt
                  ? "bg-main-blue text-white"
                  : "bg-system-searchbg text-text-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* 관광지 목록 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sub-gray font-paperlogy text-sm pt-20">
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
              />
            ))
          )}
        </div>
    </PageCard>
  );
}
