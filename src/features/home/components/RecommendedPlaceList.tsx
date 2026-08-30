"use client";

import { useState } from "react";
import { keys, searchSpots, SPOT_LIST_STALE_TIME_MS } from "@/shared/api/domains/spot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RecommendedPlaceCard } from "@/features/home/components/RecommendedPlaceCard";
import { EmptyState, PlaceCardListSkeleton } from "@/components";
import { bookmarkApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export function RecommendedPlaceList() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});
  const { data: places = [], isLoading } = useQuery({
    queryKey: keys.search({ sort: "RECOMMEND" }),
    queryFn: () =>
      searchSpots({
        sort: "RECOMMEND",
      }),
    staleTime: SPOT_LIST_STALE_TIME_MS,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: bookmarkApi.keys.list(),
    queryFn: bookmarkApi.getBookmarks,
    enabled: Boolean(accessToken),
  });

  const bookmarkedSpotIds = new Set(bookmarks.map((bookmark) => bookmark.spotId));

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: ({ spotId, isBookmarked }: { spotId: string; isBookmarked: boolean }) =>
      isBookmarked ? bookmarkApi.removeBookmark(spotId) : bookmarkApi.addBookmark(spotId),
    onMutate: ({ spotId, isBookmarked }) => {
      setOptimisticBookmarks((current) => ({ ...current, [spotId]: !isBookmarked }));
    },
    onError: (_error, { spotId }) => {
      setOptimisticBookmarks((current) => {
        const next = { ...current };
        delete next[spotId];
        return next;
      });
    },
    onSuccess: async (_data, { spotId }) => {
      await queryClient.invalidateQueries({ queryKey: bookmarkApi.keys.list() });
      setOptimisticBookmarks((current) => {
        const next = { ...current };
        delete next[spotId];
        return next;
      });
    },
  });

  const recommendedPlaces = places.filter((place) => place.isCollection && !place.collected);

  if (isLoading) return <PlaceCardListSkeleton />;

  return (
    <>
      {recommendedPlaces.length === 0 ? (
        <div className="flex h-full flex-col">
          <EmptyState
            title="추천할 관광지가 없어요"
            description="수집할 수 있는 관광지를 모두 모았어요!"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {recommendedPlaces.map((place) => {
            const spotId = place.spotId ?? "";
            const isBookmarked = optimisticBookmarks[spotId] ?? bookmarkedSpotIds.has(spotId);

            return (
              <RecommendedPlaceCard
                key={spotId}
                place={place}
                isBookmarked={isBookmarked}
                onBookmarkToggle={() => {
                  if (!spotId || spotId in optimisticBookmarks) return;
                  toggleBookmark({ spotId, isBookmarked });
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
