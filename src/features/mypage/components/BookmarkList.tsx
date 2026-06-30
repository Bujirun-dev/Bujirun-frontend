"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCard } from "./BookmarkCard";
import { PLACES } from "@/features/collection/data/places";
import { Toast } from "@/components";
import type { Category } from "@/components";

type StatusType = "completed" | "verify" | "pending" | "uncollected" | "collected";

// TODO: API 연결 시 useQuery로 교체 (isCollected → 실제 북마크 여부로 변경)
const MOCK_BOOKMARKS = PLACES.slice(0, 7).map((p) => ({
  ...p,
  category: p.category as Category,
  isBookmarked: true,
  status: (p.isCollected ? "collected" : "uncollected") as StatusType,
  imageUrl: `https://picsum.photos/seed/${p.id}/136/91`,
}));

export function BookmarkList() {
  const router = useRouter();

  // 북마크 목록 상태 (더미데이터 기반, API 연결 전까지 useState로 관리)
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS);
  // 북마크 해제 토스트 노출 여부
  const [toastVisible, setToastVisible] = useState(false);

  // 북마크 해제 시 목록에서 즉시 제거 + 토스트 노출
  const handleBookmarkToggle = (id: number) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
    // TODO: API 연결 시 mutate(id) 호출 + onError 시 롤백 처리
    setToastVisible(true);
  };

  // 북마크 목록이 비어있을 때 빈 상태 표시
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

      {/* 북마크 해제 알림 토스트 */}
      <Toast
        isVisible={toastVisible}
        message="북마크가 해제되었어요"
        onHide={() => setToastVisible(false)}
      />
    </div>
  );
}
