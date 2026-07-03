"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";
import { splitLegacyStopTags } from "@/shared/constants/category";

// 마이페이지(북마크) 전용 로그 상세보기
// - 일정 탭의 itinerary/logs/[id]와 화면 구성은 동일하지만, 일정 추가 버튼은 넣지 않음
// - URL이 /mypage/... 로 시작해서 하단 네비게이션도 마이페이지 탭으로 정상 유지됨
export default function MypageLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const log = SAMPLE_LOGS.find((l) => l.id === id);

  if (!log) {
    return (
      <PageCard>
        <div className="flex flex-1 items-center justify-center text-sub-gray text-sm">
          로그를 찾을 수 없습니다.
        </div>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <LogDetailContent
        log={{
          title: log.title,
          placeName: log.placeName,
          extraCount: log.extraCount,
          duration: log.duration,
          date: log.date,
          days: log.days.map((day) => ({
            day: day.day,
            date: day.date,
            stops: day.stops.map((stop) => {
              const { category, tags } = splitLegacyStopTags(stop.tags);
              return { time: stop.time, place: stop.place, imageUrl: stop.imageUrl, category, tags };
            }),
          })),
        }}
        onBack={() => router.back()}
      />
    </PageCard>
  );
}
