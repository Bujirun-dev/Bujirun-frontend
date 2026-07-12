"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkCard } from "./BookmarkCard";
import { Toast } from "@/components";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Category } from "@/components";

function toCategory(value?: string, name?: string): Category | undefined {
  if (!value && !name) return undefined;
  if (name?.includes("해수욕장") || name?.includes("해변")) return "sea";
  if (!value) return undefined;
  if (value.includes("자연")) return "nature";
  if (value.includes("문화") || value.includes("역사")) return "culture";
  if (value.includes("체험") || value.includes("놀이")) return "experience";
  if (value.includes("바다") || value.includes("해수욕")) return "sea";
  return undefined;
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
          category={toCategory(item.category, item.name ?? "")}
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
