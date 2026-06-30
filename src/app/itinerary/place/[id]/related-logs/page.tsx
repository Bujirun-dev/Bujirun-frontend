import { notFound } from "next/navigation";
import { RelatedLogsContent } from "@/components";
import { getRelatedLogsByPlaceName } from "@/features/mypage/data/relatedLogs";
import { getCategoryFromKo } from "@/shared/constants/category";
import { resolveItineraryPlace } from "@/features/itinerary/utils/placeDetail";

export default async function ItineraryPlaceRelatedLogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = resolveItineraryPlace(id);
  if (!place) notFound();

  return (
    <RelatedLogsContent
      placeName={place.name}
      category={getCategoryFromKo(place.category)}
      relatedLogs={getRelatedLogsByPlaceName(place.name)}
    />
  );
}
