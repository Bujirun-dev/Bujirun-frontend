"use client";

import { searchSpots } from "@/shared/api/domains/spot";
import { useQuery } from "@tanstack/react-query";
import { RecommendedPlaceCard } from "@/features/home/components/RecommendedPlaceCard";

export function RecommendedPlaceList() {
  const { data: places = [], isLoading } = useQuery({
    queryKey: ["recommended-spots"],
    queryFn: () =>
      searchSpots({
        sort: "RECOMMEND",
      }),
  });

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  const recommendedPlaces = places.filter((place) => place.isCollection && !place.collected);

  return (
    <div className="flex flex-col gap-[20px]">
      {recommendedPlaces.map((place) => (
        <RecommendedPlaceCard key={place.spotId} place={place} />
      ))}
    </div>
  );
}
