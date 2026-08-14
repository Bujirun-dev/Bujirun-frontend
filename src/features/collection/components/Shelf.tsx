import Image from "next/image";
import canopyImage from "@/assets/collection/canopy.png";
import shelfImage from "@/assets/collection/shelf.png";

const CATEGORY_TITLE = {
  바다: "SEA COLLECTION",
  자연: "NATURE COLLECTION",
  문화: "CULTURE COLLECTION",
  체험: "EXPERIENCE COLLECTION",
} as const;

type CollectionCategory = keyof typeof CATEGORY_TITLE;

type CollectionSpot = {
  spotId?: string;
  name?: string;
  collected?: boolean;
  collectionCategory?: string;
};

type ShelfProps = {
  spots: CollectionSpot[];
  category: CollectionCategory;
};

export function Shelf({ spots, category }: ShelfProps) {
  const categorySpots = spots.filter((spot) => spot.collectionCategory === category);

  const ITEMS_PER_ROW = 3;

  const rows = Array.from({
    length: Math.ceil(categorySpots.length / ITEMS_PER_ROW),
  });

  return (
    <div className="relative w-full">
      <div className="relative">
        <Image src={canopyImage} alt="" className="h-auto w-full" priority />

        <p className="absolute left-1/2 top-[8%] -translate-x-1/2 whitespace-nowrap font-giants text-lg text-text-heading">
          {CATEGORY_TITLE[category]}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((_, rowIndex) => {
          const rowSpots = categorySpots.slice(
            rowIndex * ITEMS_PER_ROW,
            rowIndex * ITEMS_PER_ROW + ITEMS_PER_ROW,
          );

          return (
            <div key={rowIndex} className="relative">
              <div className="relative z-10 grid translate-y-2 grid-cols-3 items-end gap-6 px-6">
                {Array.from({ length: ITEMS_PER_ROW }).map((_, itemIndex) => {
                  const spot = rowSpots[itemIndex];

                  if (!spot?.name) {
                    return <div key={itemIndex} />;
                  }

                  return (
                    <div key={spot.spotId ?? spot.name} className="flex flex-col items-center">
                      <Image
                        src={`/collection/${spot.name}.png`}
                        alt={spot.name}
                        width={64}
                        height={64}
                        unoptimized
                        className={`aspect-square w-full max-w-[64px] border border-collection-border object-contain ${
                          spot.collected ? "" : "grayscale"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="relative">
                <Image src={shelfImage} alt="선반 이미지" className="h-auto w-full" />

                <div className="absolute left-0 top-[42%] grid w-full grid-cols-3 gap-6 px-6">
                  {Array.from({ length: ITEMS_PER_ROW }).map((_, itemIndex) => {
                    const spot = rowSpots[itemIndex];

                    return (
                      <div
                        key={spot?.spotId ?? `label-${itemIndex}`}
                        className="flex justify-center"
                      >
                        {spot?.name && (
                          <div className="flex mt-2 h-7 w-18 items-center justify-center rounded-[2px] border border-collection-border bg-main-white px-1 text-center text-xs text-text-heading">
                            {spot.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
