"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCard } from "./BookmarkCard";
import { PLACES } from "@/features/collection/data/places";
import type { Category } from "@/components";

type StatusType = "completed" | "verify" | "pending" | "uncollected" | "collected";

const MOCK_BOOKMARKS = PLACES.slice(0, 7).map((p) => ({
  ...p,
  category: p.category as Category,
  isBookmarked: true,
  status: (p.isCollected ? "collected" : "uncollected") as StatusType,
  imageUrl: `https://picsum.photos/seed/${p.id}/136/91`,
}));

export function BookmarkList() {
  const router = useRouter();

  // TODO: API 연결 시 useQuery + useMutation으로 교체
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS);

  const handleBookmarkToggle = (id: number) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
  };

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
          name={item.name}
          category={item.category}
          status={item.status}
          isBookmarked={item.isBookmarked}
          imageUrl={item.imageUrl}
          onBookmarkToggle={() => handleBookmarkToggle(item.id)}
          onClick={() => router.push(`/mypage/bookmarks/${item.id}`)}
        />
      ))}
    </div>
  );
}
