interface ItinerarySummaryForSelection {
  id?: string;
  startAt?: string;
  endAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimestamp(value?: string): number {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function selectItinerary<T extends ItinerarySummaryForSelection>(
  itineraries: T[],
  requestedTripId: string | null,
  lastViewedItineraryId: string | null,
  today = getLocalDateString(),
): T | undefined {
  const requested = itineraries.find((trip) => trip.id === requestedTripId);
  if (requested) return requested;

  const ongoing = itineraries.filter(
    (trip) =>
      trip.startAt &&
      trip.endAt &&
      trip.startAt.slice(0, 10) <= today &&
      trip.endAt.slice(0, 10) >= today,
  );
  const lastViewed = ongoing.find((trip) => trip.id === lastViewedItineraryId);
  if (lastViewed) return lastViewed;

  const upcoming = itineraries.filter((trip) => trip.startAt && trip.startAt.slice(0, 10) > today);
  // 종료된 여행은 자동 선택에서 제외하고, 날짜 없는 기존 일정은 마지막 후보로 남긴다.
  const candidates = ongoing.length
    ? ongoing
    : upcoming.length
      ? upcoming
      : itineraries.filter(
          (trip) => !trip.startAt && (!trip.endAt || trip.endAt.slice(0, 10) >= today),
        );
  return [...candidates].sort((a, b) => {
    if (!ongoing.length && a.startAt && b.startAt) {
      const startDiff = a.startAt.slice(0, 10).localeCompare(b.startAt.slice(0, 10));
      if (startDiff) return startDiff;
    }
    return (
      getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt) ||
      getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    );
  })[0];
}

export function getDefaultItineraryDay(dates: string[], today = getLocalDateString()): number {
  // 타임라인 날짜 표기(YYYY.MM.DD)를 날짜 비교 형식으로 정규화한다.
  const normalized = dates.map((date) => date.replaceAll(".", "-"));
  const todayIndex = normalized.indexOf(today);
  if (todayIndex >= 0) return todayIndex;
  const lastIndex = normalized.length - 1;
  if (lastIndex >= 0 && normalized[lastIndex] && normalized[lastIndex] < today) return lastIndex;
  return 0;
}
