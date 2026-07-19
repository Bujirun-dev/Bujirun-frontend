"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { PageCard } from "@/components/layout/PageCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogCard } from "@/features/itinerary";
import type { Category } from "@/components/ui/CategoryChip";
import type { components } from "@/shared/api/schema.d";

type TravelLogSummary = components["schemas"]["TravelLogSummaryResponse"];

interface RelatedLogsContentProps {
  placeName?: string;
  category?: Category;
  relatedLogs: TravelLogSummary[];
  isLoading?: boolean;
  logHrefBase: string;
}

// TravelLogSummaryResponse → LogCard props 변환
function toLogCardProps(log: TravelLogSummary) {
  const date = log.startDate?.replace(/-/g, ".") ?? "";
  const placeName = "부산 여행";
  const extraCount = log.totalSpots != null && log.totalSpots > 1 ? log.totalSpots - 1 : undefined;

  return {
    imageUrl: log.thumbnailPhotoUrl ?? "",
    placeName,
    extraCount,
    author: log.authorNickname ?? "",
    duration: "",
    date,
    downloadCount: log.addedCount ?? 0,
  };
}

export function RelatedLogsContent({
  placeName,
  category,
  relatedLogs,
  isLoading,
  logHrefBase,
}: RelatedLogsContentProps) {
  const router = useRouter();

  return (
    <PageCard>
      <div className="flex items-center gap-3 pb-4 shrink-0">
        <BackButton className="bg-transparent" onClick={() => router.back()} />
        <h1 className="font-ssurround font-bold text-lg text-text-heading">관련 로그 둘러보기</h1>
      </div>

      {placeName && (
        <div className="flex items-center gap-2 pb-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-system-selected border border-main-blue/30 rounded-full px-3 py-1.5">
            <span className="text-sm">📍</span>
            <span className="text-md font-semibold text-sub-deepblue">{placeName}</span>
          </div>
          {category && <CategoryChip category={category} size="lg" />}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto pb-6">
        {isLoading ? (
          <LoadingState message="관련 로그를 불러오는 중이에요" />
        ) : relatedLogs.length === 0 ? (
          <EmptyState title="아직 관련 로그가 없어요" />
        ) : (
          <div className="flex flex-col gap-4">
            {relatedLogs.map((log) => {
              const cardProps = toLogCardProps(log);
              return (
                <LogCard
                  key={log.id}
                  {...cardProps}
                  onClick={() => log.id && router.push(`${logHrefBase}/${log.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageCard>
  );
}
