"use client";

import { useRouter } from "next/navigation";
import { BookmarkCard } from "./BookmarkCard";
import { PLACES } from "@/features/collection/data/places";
import type { Category } from "@/components";

// StatusBadge의 StatusType과 동일한 타입 로컬 선언
type StatusType = "completed" | "verify" | "pending" | "uncollected" | "collected";

// TODO: API 연결 시 useQuery로 교체 (isCollected → 실제 북마크 여부로 변경)
const MOCK_BOOKMARKS = PLACES.slice(0, 7).map((p) => ({
  ...p,
  category: p.category as Category,
  isBookmarked: true,
  status: (p.isCollected ? "collected" : "uncollected") as StatusType,
  // TODO: API 연결 시 실제 이미지 URL로 교체
  imageUrl: `https://picsum.photos/seed/${p.id}/136/91`,
}));
export function BookmarkList() {
  const router = useRouter();

  // TODO: API 연결 시 useQuery로 북마크 목록 fetch
  const bookmarks = MOCK_BOOKMARKS;

  // 북마크 목록이 비어있을 때 빈 상태 표시
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-sub-gray">저장된 북마크가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookmarks.map((item) => (
        <BookmarkCard
          key={item.id}
          name={item.name}
          category={item.category}
          status={item.status}
          isBookmarked={item.isBookmarked}
          imageUrl={item.imageUrl} // 이거 빠져있었어요!
          onBookmarkToggle={() => {
            // TODO: 북마크 on/off API 연결
          }}
          onClick={() => router.push(`/mypage/bookmarks/${item.id}`)}
        />
      ))}
    </div>
  );
}
