"use client";

import { PLACES } from "@/features/home/data/places";
import { useRouter } from "next/navigation";
import { PlaceCard } from "@/components/place/PlaceCard";

type Place = (typeof PLACES)[number];

interface RecommendedPlaceCardProps {
  place: Place;
}

export function RecommendedPlaceCard({ place }: RecommendedPlaceCardProps) {
  const router = useRouter();

  return (
    <PlaceCard
      imageUrl={place.imageUrl.src}
      name={place.name}
      category={place.category}
      status="pending"
      showBookmark
      isBookmarked={place.isBookmarked}
      onClick={() => router.push(`/home/recommend/${place.id}`)}
    />
  );
}
