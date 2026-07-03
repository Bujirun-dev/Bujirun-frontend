"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";
import { PLACES } from "@/features/home/data/places";
import { CategoryChip } from "@/components";

export function PlaceSection() {
  const router = useRouter();
  const recommendedPlaces = PLACES.filter((place) => !place.isCollected).slice(0, 6);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-ssurround text-lg text-text-heading">여기는 어때요?</h2>
        <button
          type="button"
          className="flex items-center text-sm font-semibold text-sub-darkgray"
          onClick={() => router.push("/home/recommend")}
        >
          더보기
          <svg viewBox="0 0 24 24" className="size-5 fill-sub-darkgray" aria-hidden="true">
            <path d="M15.4,9.88,10.81,5.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L14,11.29a1,1,0,0,1,0,1.42L9.4,17.29a1,1,0,0,0,1.41,1.42l4.59-4.59A3,3,0,0,0,15.4,9.88Z" />
          </svg>
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recommendedPlaces.map((place) => (
          <button
            key={place.id}
            type="button"
            className="relative h-25 w-[160px] shrink-0 overflow-hidden rounded-[15px] active:opacity-80"
            onClick={() => router.push(`/home/recommend/${place.id}`)}
          >
            <Image
              src={place.imageUrl}
              alt={place.name}
              fill
              className="object-cover"
              sizes="160px"
            />

            <div className="absolute right-2 top-2">
              <CategoryChip category={place.category} variant="strong" />
            </div>

            <div className="absolute bottom-2 left-2">
              <span className="inline-flex rounded-[8px] bg-system-blackbg px-2.5 py-1.5 text-sm font-semibold text-main-white backdrop-blur-sm">
                {place.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
