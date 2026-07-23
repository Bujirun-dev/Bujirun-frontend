"use client";

// src/app/itinerary/logs/[id]/page.tsx
// 다른 사람 로그 읽기 전용 상세 + 일정 담기 버튼
// GET /api/logs/{id} → TravelLogDetailResponse

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import calendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg?url";
import { PageCard, LoadingState, ErrorState } from "@/components";
import { LogDetailContent, toLogDetailData } from "@/components/log/LogDetailContent";
import { ImportLogModal } from "@/features/itinerary";
import { useQuery } from "@tanstack/react-query";
import { travelLogApi } from "@/shared/api/domains";
import { useAuthStore } from "@/shared/stores/useAuthStore";

// 로그 상세 데이터 조회 훅
function useLogDetail(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: travelLogApi.keys.detail(id),
    queryFn: () => travelLogApi.getLog(id),
    enabled: !!accessToken && !!id,
  });
}

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importTimerRef = useRef<number | null>(null);
  const { data: log, isLoading } = useLogDetail(id);

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

  // 실제 담기 작업(로그 → 일정 변환)은 /itinerary 쪽 useCollaborativeItinerary가
  // importedLogId 쿼리 파라미터를 보고 처리한다(Yjs로 반영 + 다른 참여자에게도 실시간 전파).
  const handleImportLog = () => {
    setIsImporting(true);
    importTimerRef.current = window.setTimeout(() => {
      setIsImporting(false);
      setShowAddModal(false);
      router.push(`/itinerary?importedLogId=${id}`);
    }, 600);
  };

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
      <LogDetailContent
        log={toLogDetailData(log)}
        onBack={() => router.back()}
        headerRight={
          // 일정 담기 버튼
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
        authorNickname={log.days?.[0]?.items?.[0]?.spotName ?? ""}
        onClose={handleCloseAddModal}
        onConfirm={handleImportLog}
      />
    </PageCard>
  );
}
