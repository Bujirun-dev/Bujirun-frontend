"use client";

import { searchSpots } from "@/shared/api/domains/spot";
import { useQuery } from "@tanstack/react-query";
import { RecommendedPlaceCard } from "@/features/home/components/RecommendedPlaceCard";
import { LoadingState, EmptyState } from "@/components";

export function RecommendedPlaceList() {
  const { data: places = [], isLoading } = useQuery({
    queryKey: ["recommended-spots"],
    queryFn: () =>
      searchSpots({
        sort: "RECOMMEND",
      }),
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <LoadingState message="추천 관광지를 불러오는 중이에요" />
      </div>
    );
  }

  const recommendedPlaces = places.filter((place) => place.isCollection && !place.collected);

  if (recommendedPlaces.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <EmptyState title="추천할 관광지가 없어요" description="이미 다 모으셨나봐요!" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {recommendedPlaces.map((place) => (
        <RecommendedPlaceCard key={place.spotId} place={place} />
      ))}
    </div>
  );
}
