"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { SwitchButton } from "@/features/collection/components/SwitchButton";
import { SAMPLE_LOGS } from "@/features/collection/data/sampleLogs";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
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

  const handleVisibilityToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const currentIsVisible = isVisible || log.isVisible;

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
        headerRight={<SwitchButton isPublic={currentIsVisible} onClick={handleVisibilityToggle} />}
      />
    </PageCard>
  );
}
