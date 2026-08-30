"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkCard } from "./BookmarkCard";
import { Toast, EmptyState, LoadingBoundary, ErrorState } from "@/components";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { BOOKMARK_TOAST_MESSAGE } from "@/shared/constants/bookmark";
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
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);

  const {
    data: bookmarks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: bookmarkApi.keys.list(),
    queryFn: () => bookmarkApi.getBookmarks(),
    enabled: !!accessToken,
  });

  const { mutate: removeBookmark } = useMutation({
    mutationFn: (spotId: string) => bookmarkApi.removeBookmark(spotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
      setToastVariant("success");
      setToastVisible(true);
    },
    onError: () => {
      setToastVariant("error");
      setToastVisible(true);
    },
  });

  if (isError) {
    return (
      <ErrorState
        code={500}
        title="북마크를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        primaryAction={{
          label: "다시 시도하기",
          onClick: () => refetch(),
        }}
      />
    );
  }

  return (
    <LoadingBoundary isLoading={isLoading} message="북마크를 불러오는 중이에요">
      <>
        {bookmarks.length === 0 ? (
          <EmptyState
            className="-translate-y-5"
            title="아직 저장된 관광지가 없어요"
            description={
              <>
                마음에 드는 관광지를 저장해두고
                <br />
                나중에 다시 확인해보세요.
              </>
            }
            primaryAction={{
              label: "관광지 둘러보기",
              onClick: () => router.push("/mypage/bookmarks/search"),
            }}
          />
        ) : (
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
          </div>
        )}

        <Toast
          isVisible={toastVisible}
          message={
            toastVariant === "success"
              ? BOOKMARK_TOAST_MESSAGE.removed
              : BOOKMARK_TOAST_MESSAGE.error
          }
          onHide={() => setToastVisible(false)}
          variant={toastVariant}
        />
      </>
    </LoadingBoundary>
  );
}
