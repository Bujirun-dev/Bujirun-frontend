import { getPlaceById, getPlaces, getSchedules } from "@/mocks";
import type { Place } from "@/shared/types";

export function resolveItineraryPlace(id: string): Place | undefined {
  const directPlace = getPlaceById(id) ?? getPlaces().find((place) => place.contentId === id);
  if (directPlace) return directPlace;

  for (const schedule of getSchedules()) {
    for (const day of schedule.days) {
      const item = day.items.find((scheduleItem) => scheduleItem.id === id);
      if (item) return getPlaceById(item.spotId);
    }
  }

  return undefined;
}

export function getPlaceDescription(placeName: string): string {
  return `${placeName}은(는) 부산 여행 일정에서 방문하기 좋은 관광지입니다. 주변 관광지와 함께 둘러보기 좋고, 일정 중 잠시 머물며 분위기를 느끼기 좋은 장소예요.`;
}
