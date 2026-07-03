"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { PageCard } from "@/components/layout/PageCard";
import { LogCard } from "@/features/itinerary";
import type { Category } from "@/components/ui/CategoryChip";
import type { RelatedLog } from "@/features/mypage/data/relatedLogs";

interface RelatedLogsContentProps {
  placeName?: string;
  category?: Category;
  relatedLogs: RelatedLog[];
}

export function RelatedLogsContent({ placeName, category, relatedLogs }: RelatedLogsContentProps) {
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

      <div className="flex-1 overflow-y-auto pb-6">
        {relatedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <span className="text-4xl">📭</span>
            <p className="text-sm text-sub-gray font-medium">아직 관련 로그가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {relatedLogs.map((log) => (
              <LogCard
                key={log.id}
                imageUrl={log.imageUrl}
                placeName={log.placeName}
                extraCount={log.extraCount}
                author={log.author}
                duration={log.duration}
                date={log.date}
                downloadCount={log.downloadCount}
                onClick={() => router.push(`/itinerary/logs/${log.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageCard>
  );
}
