"use client";

import { keys, searchSpots, SPOT_LIST_STALE_TIME_MS } from "@/shared/api/domains/spot";
import { useQuery } from "@tanstack/react-query";
import { RecommendedPlaceCard } from "@/features/home/components/RecommendedPlaceCard";
import { EmptyState, LoadingBoundary } from "@/components";

export function RecommendedPlaceList() {
  const { data: places = [], isLoading } = useQuery({
    queryKey: keys.search({ sort: "RECOMMEND" }),
    queryFn: () =>
      searchSpots({
        sort: "RECOMMEND",
      }),
    staleTime: SPOT_LIST_STALE_TIME_MS,
  });

  const recommendedPlaces = places.filter((place) => place.isCollection && !place.collected);

  return (
    <LoadingBoundary isLoading={isLoading} message="추천 관광지를 불러오는 중이에요">
      {recommendedPlaces.length === 0 ? (
        <div className="flex h-full flex-col">
          <EmptyState
            title="추천할 관광지가 없어요"
            description="수집할 수 있는 관광지를 모두 모았어요!"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {recommendedPlaces.map((place) => (
            <RecommendedPlaceCard key={place.spotId} place={place} />
          ))}
        </div>
      )}
    </LoadingBoundary>
  );
}
