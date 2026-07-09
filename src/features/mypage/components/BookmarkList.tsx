"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkCard } from "./BookmarkCard";
import { Toast } from "@/components";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Category } from "@/components";

// API category 문자열 → Category 타입 변환
const VALID_CATEGORIES = ["sea", "nature", "culture", "experience"] as const;

function toCategory(value?: string): Category | undefined {
  return VALID_CATEGORIES.includes(value as Category) ? (value as Category) : undefined;
}

export function BookmarkList() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toastVisible, setToastVisible] = useState(false);

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: bookmarkApi.keys.list(),
    queryFn: () => bookmarkApi.getBookmarks(),
    enabled: !!accessToken,
  });

  const { mutate: removeBookmark } = useMutation({
    mutationFn: (spotId: string) => bookmarkApi.removeBookmark(spotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
      setToastVisible(true);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-sub-gray">불러오는 중...</p>
      </div>
    );
  }

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
          key={item.spotId}
          name={item.name ?? ""}
          category={toCategory(item.category)}
          isBookmarked={true}
          imageUrl={item.thumbnailUrl ?? undefined}
          onBookmarkToggle={() => item.spotId && removeBookmark(item.spotId)}
          onClick={() => item.spotId && router.push(`/mypage/bookmarks/${item.spotId}`)}
        />
      ))}

      <Toast
        isVisible={toastVisible}
        message="북마크가 해제되었어요"
        onHide={() => setToastVisible(false)}
      />
    </div>
  );
}
