import { notFound } from "next/navigation";
import { RelatedLogsContent } from "@/components";
import { getRelatedLogsByPlaceName } from "@/features/mypage/data/relatedLogs";
import { getCategoryFromKo } from "@/shared/constants/category";
import { resolveItineraryPlace } from "@/features/itinerary/utils/placeDetail";
import type { Category } from "@/components";

const CATEGORIES: Category[] = ["sea", "nature", "culture", "experience"];

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getCategoryParam(value: string | string[] | undefined): Category | undefined {
  const category = getStringParam(value);
  return CATEGORIES.find((item) => item === category);
}

export default async function ItineraryPlaceRelatedLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placeName?: string | string[]; category?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const place = resolveItineraryPlace(id);
  const placeName = place?.name ?? getStringParam(query.placeName);
  const category = place ? getCategoryFromKo(place.category) : getCategoryParam(query.category);

  if (!placeName) notFound();

  return (
    <RelatedLogsContent
      placeName={placeName}
      category={category}
      relatedLogs={getRelatedLogsByPlaceName(placeName)}
      logHrefBase="/itinerary/logs"
    />
  );
}
