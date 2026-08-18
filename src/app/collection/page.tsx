"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VendingMachine } from "@/features/collection/components/VendingMachine";
import { Shelf } from "@/features/collection/components/Shelf";
import { useCollectionProgress } from "@/shared/hooks/useCollectionProgress";
import { useQuery } from "@tanstack/react-query";
import { getMyCollection, keys as collectionKeys } from "@/shared/api/domains/collection";
import {
  CategoryTabs,
  type CollectionCategory,
} from "@/features/collection/components/CategoryTabs";

export default function CollectionPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as CollectionCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<CollectionCategory>(
    categoryParam ?? "전체",
  );

  const handleRecordClick = () => {
    router.push("/collection/records");
  };

  const handleSpotClick = (spotId: string) => {
    router.push(`/collection/place/${spotId}?category=${encodeURIComponent(selectedCategory)}`);
  };

  const { data: collection } = useQuery({
    queryKey: collectionKeys.my(),
    queryFn: getMyCollection,
  });

  const spots = collection?.entries ?? [];

  useEffect(() => {
    spots.forEach((spot) => {
      if (!spot.name) return;

      const image = new window.Image();
      image.src = `/collection/${spot.name}.png`;
    });
  }, [spots]);

  const collectionSpots = spots.filter((spot) => {
    if (selectedCategory === "전체") return true;

    return spot.collectionCategory === selectedCategory;
  });

  return (
    <section className="pb-[24px]">
      <div className="flex items-end gap-[10px]">
        <h1 className="font-ssurround text-2xl text-text-heading">부산 도감</h1>
        <p className="pb-[2px] font-dxsubtitles text-md">부산 곳곳에 남긴 나의 여행 발자국 🐾</p>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[340px]">
        <CategoryTabs selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      <div className="mt-3">
        {selectedCategory === "전체" ? (
          <VendingMachine
            spots={collectionSpots}
            onCategorySelect={setSelectedCategory}
            onSpotClick={handleSpotClick}
            onRecordClick={handleRecordClick}
          />
        ) : (
          <Shelf
            spots={collectionSpots}
            category={selectedCategory}
            onSpotClick={handleSpotClick}
          />
        )}
      </div>
    </section>
  );
}
