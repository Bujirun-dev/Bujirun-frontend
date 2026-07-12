"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getItineraries, getItinerary, keys } from "@/shared/api/domains/itinerary";
import { getLog } from "@/shared/api/domains/travel-log";
import { getNearestItineraryDay } from "@/features/home/utils/getNearestItineraryDay";

export function useTodayItinerary() {
  const itinerariesQuery = useQuery({
    queryKey: keys.lists(),
    queryFn: getItineraries,
  });

  const itineraries = itinerariesQuery.data ?? [];

  const itineraryQueries = useQueries({
    queries: itineraries
      .filter(
        (
          itinerary,
        ): itinerary is typeof itinerary & {
          id: string;
        } => Boolean(itinerary.id),
      )
      .map((itinerary) => ({
        queryKey: keys.detail(itinerary.id),
        queryFn: () => getItinerary(itinerary.id),
      })),
  });

  const nearestSchedule = useMemo(() => {
    const schedules = itineraryQueries.flatMap((query) => {
      const itinerary = query.data;

      if (!itinerary) {
        return [];
      }

      return (itinerary.days ?? [])
        .filter((day): day is typeof day & { date: string } => Boolean(day.date))
        .map((day) => ({
          itinerary,
          day,
          date: day.date,
        }));
    });

    return getNearestItineraryDay<(typeof schedules)[number]>(schedules);
  }, [itineraryQueries]);

  const itineraryId = nearestSchedule?.itinerary.id;

  const logQuery = useQuery({
    queryKey: ["logs", "itinerary", itineraryId],
    queryFn: () => getLog(itineraryId as string),
    enabled: Boolean(itineraryId),
  });

  const items = useMemo(
    () =>
      [...(nearestSchedule?.day.items ?? [])].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
      ),
    [nearestSchedule],
  );

  const isDetailLoading = itineraryQueries.some((query) => query.isLoading);

  const detailErrorQuery = itineraryQueries.find((query) => query.isError);

  return {
    itinerary: nearestSchedule?.itinerary,
    logId: logQuery.data?.id,
    day: nearestSchedule?.day,
    items,
    hasSchedule: Boolean(nearestSchedule),
    isLoading: itinerariesQuery.isLoading || isDetailLoading || logQuery.isLoading,
    isError: itinerariesQuery.isError || Boolean(detailErrorQuery) || logQuery.isError,
    error: itinerariesQuery.error ?? detailErrorQuery?.error ?? logQuery.error,
  };
}
