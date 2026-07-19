"use client";

import type { OpResponse } from "@/shared/api/types";
import { useRouter } from "next/navigation";
import { PlaceCard } from "@/components/place/PlaceCard";

type Place = OpResponse<"search">[number];

interface RecommendedPlaceCardProps {
  place: Place;
}

export function RecommendedPlaceCard({ place }: RecommendedPlaceCardProps) {
  const router = useRouter();

  if (!place.thumbnailUrl || !place.name || !place.spotId || !place.category) {
    return null;
  }

  const category = place.category.includes("자연")
    ? "nature"
    : place.category.includes("바다")
      ? "sea"
      : place.category.includes("문화")
        ? "culture"
        : "experience";

  return (
    <PlaceCard
      imageUrl={place.thumbnailUrl}
      name={place.name}
      category={category}
      status="pending"
      showBookmark
      isBookmarked={place.collected}
      onClick={() => router.push(`/home/recommend/${place.spotId}`)}
    />
  );
}
