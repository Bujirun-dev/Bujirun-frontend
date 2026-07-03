"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";

export default function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  const { logId } = use(params);
  const router = useRouter();
  const log = SAMPLE_LOGS.find((l) => l.id === logId);

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
          days: log.days,
        }}
        onBack={() => router.back()}
      />
    </PageCard>
  );
}
