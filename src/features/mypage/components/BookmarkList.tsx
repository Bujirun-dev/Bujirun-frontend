"use client";

import { BookmarkCard } from "./BookmarkCard";
import type { Category } from "@/components";
import place1 from "@/assets/place/place1.png";
import place2 from "@/assets/place/place2.png";
import place3 from "@/assets/place/place3.png";
import place4 from "@/assets/place/place4.png";
import place5 from "@/assets/place/place5.png";
import place6 from "@/assets/place/place6.png";
import place7 from "@/assets/place/place7.png";

// TODO: API 연결 시 useQuery로 교체
const MOCK_BOOKMARKS = [
  {
    id: "1",
    name: "송도 해수욕장",
    category: "sea" as Category,
    imageUrl: place1,
    isBookmarked: true,
    status: "uncollected" as const,
  },
  {
    id: "2",
    name: "감천 문화마을",
    category: "culture" as Category,
    imageUrl: place2,
    isBookmarked: true,
    status: "collected" as const,
  },
  {
    id: "3",
    name: "태종대",
    category: "nature" as Category,
    imageUrl: place3,
    isBookmarked: true,
    status: "uncollected" as const,
  },
  {
    id: "4",
    name: "해동 용궁사",
    category: "culture" as Category,
    imageUrl: place4,
    isBookmarked: true,
    status: "collected" as const,
  },
  {
    id: "5",
    name: "광안리 해수욕장",
    category: "sea" as Category,
    imageUrl: place5,
    isBookmarked: true,
    status: "uncollected" as const,
  },
  {
    id: "6",
    name: "오륙도",
    category: "nature" as Category,
    imageUrl: place6,
    isBookmarked: true,
    status: "collected" as const,
  },
  {
    id: "7",
    name: "부산 시민공원",
    category: "experience" as Category,
    imageUrl: place7,
    isBookmarked: true,
    status: "uncollected" as const,
  },
];

export function BookmarkList() {
  const bookmarks = MOCK_BOOKMARKS;

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-sub-gray">저장된 북마크가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[30px]">
      {bookmarks.map((item) => (
        <BookmarkCard
          key={item.id}
          imageUrl={item.imageUrl}
          name={item.name}
          category={item.category}
          status={item.status}
          isBookmarked={item.isBookmarked}
          onBookmarkToggle={() => {
            // TODO: 북마크 on/off API 연결
          }}
          onClick={() => {
            // TODO: 관광지 상세 페이지 이동
          }}
        />
      ))}
    </div>
  );
}
