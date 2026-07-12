interface DatedItineraryItem {
  date: string;
}

function getDateValue(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

export function getNearestItineraryDay<T extends DatedItineraryItem>(
  days: readonly T[],
  baseDate = new Date(),
) {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  return [...days]
    .filter((day) => getDateValue(day.date) >= today.getTime())
    .sort((a, b) => getDateValue(a.date) - getDateValue(b.date))[0];
}
