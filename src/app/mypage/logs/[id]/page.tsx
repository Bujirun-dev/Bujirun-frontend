"use client";

// src/app/mypage/logs/[id]/page.tsx
// GET /api/logs/{id} → TravelLogDetailResponse

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageCard, LoadingState, ErrorState } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

// TravelLogDetailResponse → LogDetailContent props 변환
function toLogDetailData(log: NonNullable<ReturnType<typeof useLogDetail>["data"]>) {
  return {
    title: log.title ?? "",
    placeName: log.days?.[0]?.items?.[0]?.spotName ?? "", // 첫 번째 스팟 이름으로 대체
    extraCount: log.totalSpots != null && log.totalSpots > 1 ? log.totalSpots - 1 : undefined,
    duration: "", // TODO: schema에 endAt 없어서 계산 불가, 백엔드 필드 추가되면 교체
    date: log.startDate?.replace(/-/g, ".") ?? "",
    days: (log.days ?? []).map((day) => ({
      day: day.dayNumber ?? 1,
      date: day.date?.replace(/-/g, ".") ?? "",
      stops: (day.items ?? []).map((item) => ({
        time: item.arrivalTime ?? "",
        place: item.spotName ?? "",
        imageUrl:
          item.photos?.find((p) => p.representative)?.photoUrl ??
          item.photos?.[0]?.photoUrl ??
          undefined,
        tags: item.hashtags?.map((h) => `#${h.tag}`) ?? [],
      })),
    })),
  };
}

// useQuery를 밖에서 타입 추론용으로 사용
function useLogDetail(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: travelLogApi.keys.detail(id),
    queryFn: () => travelLogApi.getLog(id),
    enabled: !!accessToken && !!id,
  });
}

export default function MypageLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: log, isLoading } = useLogDetail(id);

  if (isLoading) {
    return (
      <PageCard>
        <LoadingState message="로그를 불러오는 중이에요" />
      </PageCard>
    );
  }

  if (!log) {
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
      <LogDetailContent log={toLogDetailData(log)} onBack={() => router.back()} />
    </PageCard>
  );
}
