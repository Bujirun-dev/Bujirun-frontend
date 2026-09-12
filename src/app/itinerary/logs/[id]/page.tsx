"use client";

// src/app/itinerary/logs/[id]/page.tsx
// 다른 사람 로그 읽기 전용 상세 + 일정 담기 버튼
// GET /api/logs/{id} → TravelLogDetailResponse

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import calendarPlusIcon from "@/assets/icons/itinerary/calendar-plus.svg?url";
import { getLastViewedItineraryId } from "@/shared/constants/itinerary";
import { PageCard, ErrorState, LoadingBoundary } from "@/components";
import { LogDetailContent, toLogDetailData } from "@/components/log/LogDetailContent";
import { ImportLogModal } from "@/features/itinerary";
import { useQuery } from "@tanstack/react-query";
import { itineraryApi, travelLogApi } from "@/shared/api/domains";
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
  // 담을 여행이 하나도 없으면 "내 일정에 추가"는 할 수 있는 일이 없다. 예전에는 그래도
  // 버튼이 눌려서, 담기를 누르면 일정 화면으로 보내놓고 아무 일도 일어나지 않았다.
  // (여행이 없을 때 여행 목록 화면이 로그 둘러보기로 안내하는 경로가 있어서 실제로 자주
  //  밟힌다 — 그 경로로 들어온 사람은 둘러보기만 할 수 있어야 한다.)
  const { data: itineraries, isLoading: isItinerariesLoading } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });
  const hasItinerary = (itineraries?.length ?? 0) > 0;

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
      // 담을 여행을 명시하지 않으면 일정 화면의 폴백 규칙("오늘 진행 중 → 최근 수정")이
      // 대상을 정해버려서, 보고 있던 여행이 아닌 다른 여행에 로그가 들어갔다.
      const targetTripId = getLastViewedItineraryId();
      router.push(
        targetTripId
          ? `/itinerary?importedLogId=${id}&tripId=${targetTripId}`
          : `/itinerary?importedLogId=${id}`,
      );
    }, 600);
  };

  return (
    <PageCard>
      <LoadingBoundary isLoading={isLoading} message="로그를 불러오는 중이에요">
        {!log ? (
          <ErrorState
            code={404}
            title="로그를 찾을 수 없어요"
            description="삭제되었거나 존재하지 않는 로그예요."
            primaryAction={{
              label: "이전으로 돌아가기",
              onClick: () => router.back(),
            }}
          />
        ) : (
          <>
            <LogDetailContent
              log={toLogDetailData(log)}
              onBack={() => router.back()}
              headerRight={
                // 일정 담기 버튼
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={!hasItinerary || isItinerariesLoading}
                  aria-label={hasItinerary ? "내 일정에 추가" : "담을 여행이 없어 추가할 수 없어요"}
                  title={hasItinerary ? undefined : "먼저 여행을 만들어야 담을 수 있어요"}
                  className="size-[28px] rounded-lg bg-system-scroll border-[0.5px] border-main-blue flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Image src={calendarPlusIcon} alt="" width={16} height={16} aria-hidden />
                </button>
              }
            />

            <ImportLogModal
              isOpen={showAddModal}
              isLoading={isImporting}
              authorNickname={log.groupMembers?.[0]?.nickname ?? ""}
              onClose={handleCloseAddModal}
              onConfirm={handleImportLog}
            />
          </>
        )}
      </LoadingBoundary>
    </PageCard>
  );
}
