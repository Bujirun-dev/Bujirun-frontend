"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import calendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg?url";
import { PageCard, ErrorState } from "@/components";
import { LogDetailContent } from "@/components/log/LogDetailContent";
import { ImportLogModal } from "@/features/itinerary";
import { SAMPLE_LOGS } from "@/features/itinerary/data/sampleLogs";

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importTimerRef = useRef<number | null>(null);
  const log = SAMPLE_LOGS.find((l) => l.id === id);

  useEffect(() => {
    return () => {
      const timerId = importTimerRef.current;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const handleCloseAddModal = () => {
    const timerId = importTimerRef.current;
    if (timerId) window.clearTimeout(timerId);
    importTimerRef.current = null;
    setIsImporting(false);
    setShowAddModal(false);
  };

  const handleImportLog = () => {
    setIsImporting(true);
    importTimerRef.current = window.setTimeout(() => {
      setIsImporting(false);
      setShowAddModal(false);
      router.push("/itinerary");
    }, 600);
  };

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
            stops: day.stops.map((stop) => ({
              time: stop.time,
              place: stop.place,
              imageUrl: stop.imageUrl,
              tags: stop.tags,
            })),
          })),
        }}
        onBack={() => router.back()}
        headerRight={
          <button
            onClick={() => setShowAddModal(true)}
            className="size-[28px] rounded-lg bg-system-scroll border-[0.5px] border-main-blue flex items-center justify-center shrink-0"
          >
            <Image src={calendarPlusIcon} alt="" width={16} height={16} aria-hidden />
          </button>
        }
      />

      <ImportLogModal
        isOpen={showAddModal}
        isLoading={isImporting}
        authorNickname={log?.author}
        onClose={handleCloseAddModal}
        onConfirm={handleImportLog}
      />
    </PageCard>
  );
}
