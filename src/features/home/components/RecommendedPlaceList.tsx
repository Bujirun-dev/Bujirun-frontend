"use client";
import { PLACES } from "@/features/home/data/places";
import { RecommendedPlaceCard } from "@/features/home/components/RecommendedPlaceCard";

const recommendedPlaces = PLACES.filter((place) => !place.isCollected);

export function RecommendedPlaceList() {
  return (
    <div className="flex flex-col gap-[20px]">
      {recommendedPlaces.map((item) => (
        <RecommendedPlaceCard key={item.id} place={item} />
      ))}
    </div>
  );
}
