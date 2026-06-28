"use client";

import { BookmarkCard } from "./BookmarkCard";
import type { Category } from "@/components";

// TODO: API 연결 시 useQuery로 교체
const MOCK_BOOKMARKS = [
  {
    id: "1",
    name: "송도 해수욕장",
    category: "sea" as Category,
    imageUrl: "",
    isBookmarked: true,
  },
  {
    id: "2",
    name: "송도 해수욕장",
    category: "sea" as Category,
    imageUrl: "",
    isBookmarked: true,
  },
  {
    id: "3",
    name: "송도 해수욕장",
    category: "sea" as Category,
    imageUrl: "",
    isBookmarked: true,
  },
];

export function BookmarkList() {
  // TODO: API 연결 시 북마크 목록 fetch
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
          isBookmarked={item.isBookmarked}
          onBookmarkToggle={() => {
            // TODO: 북마크 on/off API 연결
            console.log("북마크 토글:", item.id);
          }}
          onClick={() => {
            // TODO: 관광지 상세 페이지 이동
          }}
        />
      ))}
    </div>
  );
}
