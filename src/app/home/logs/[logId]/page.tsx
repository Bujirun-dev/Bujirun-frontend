"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageCard, LoadingState, ErrorState } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { useQuery } from "@tanstack/react-query";
import { getLog, keys } from "@/shared/api/domains/travel-log";

export default function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = use(params);
  const router = useRouter();

  const {
    data: log,
    isLoading,
    isError,
  } = useQuery({
    queryKey: keys.detail(logId),
    queryFn: () => getLog(logId),
  });

  const detailLog = useMemo(() => {
    if (!log) {
      return null;
    }

    return {
      title: log.title ?? "제목 없는 로그",
      placeName: log.title ?? "부산 여행 로그",
      extraCount: Math.max((log.totalSpots ?? 0) - 1, 0),
      duration: log.duration ?? "",
      date: log.startDate ?? "",
      days: (log.days ?? []).map((day) => ({
        day: day.dayNumber ?? 0,
        date: day.date ?? "",
        stops: (day.items ?? []).map((item) => ({
          time: item.arrivalTime ?? "",
          place: item.spotName ?? "",
          imageUrl:
            item.photos?.find((photo) => photo.representative)?.photoUrl ??
            item.photos?.[0]?.photoUrl ??
            "",
          tags: (item.hashtags ?? []).map((hashtag) => hashtag.tag ?? ""),
        })),
      })),
    };
  }, [log]);

  if (isLoading) {
    return (
      <PageCard>
        <LoadingState message="로그를 불러오는 중이에요" />
      </PageCard>
    );
  }

  if (isError || !detailLog) {
    return (
      <PageCard>
        <ErrorState
          code={404}
          title="로그를 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 로그예요."
        />
      </PageCard>
    );
  }

  return (
    <PageCard>
      <LogDetailContent log={detailLog} onBack={() => router.back()} />
    </PageCard>
  );
}
