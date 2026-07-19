"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { useRouter } from "next/navigation";

import { useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { travelLogApi, userApi, spotApi } from "@/shared/api/domains";
import { convertTripLogToReceipt } from "@/features/receipt/utils/convertTripLogToReceipt";
import { RecordDeleteModal } from "@/features/collection/components/RecordDeleteModal";
import { TripReceiptModal } from "@/features/receipt/components/TripReceiptModal";
import type { ReceiptData } from "@/features/receipt/types/receipt";
import bookIcon from "@/assets/icons/collection/book.png";
import { Card, CategoryChip, PageCard, Toast, LoadingState, ErrorState, EmptyState } from "@/components";
import type { Category } from "@/components/ui/CategoryChip";
import { TripRecordItem } from "@/features/collection/components/TripRecordItem";
import { getCategoryFromKo } from "@/shared/constants/category";

export default function CollectionRecordsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: myLogs = [],
    isLoading: isLogsLoading,
    isError: isLogsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: travelLogApi.keys.mine(),
    queryFn: travelLogApi.getMyLogs,
  });
  const { data: spots = [] } = useQuery({
    queryKey: spotApi.keys.search(),
    queryFn: () => spotApi.searchSpots(),
  });

  // 수집된 장소 목록
  const collectedPlaces = useMemo(
    () => spots.filter((spot) => spot.isCollection && spot.collected),
    [spots],
  );
  const collectedPlaceCount = collectedPlaces.length;

  // 최애 카테고리 계산
  const favoriteCategory = useMemo(() => {
    const count = collectedPlaces.reduce<Partial<Record<Category, number>>>((acc, place) => {
      const category = getCategoryFromKo(place.category);

      acc[category] = (acc[category] ?? 0) + 1;

      acc[category] = (acc[category] ?? 0) + 1;

      return acc;
    }, {});

    return Object.entries(count).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as
      | Category
      | undefined;
  }, [collectedPlaces]);

  const deleteToastIcon = (
    <svg viewBox="0 0 512 512" className="size-[14px] shrink-0 fill-main-white" aria-hidden="true">
      <path d="M448,85.333h-66.133C371.66,35.703,328.002,0.064,277.333,0h-42.667c-50.669,0.064-94.327,35.703-104.533,85.333H64c-11.782,0-21.333,9.551-21.333,21.333S52.218,128,64,128h21.333v277.333C85.404,464.214,133.119,511.93,192,512h128c58.881-0.07,106.596-47.786,106.667-106.667V128H448c11.782,0,21.333,9.551,21.333-21.333S459.782,85.333,448,85.333z M234.667,362.667c0,11.782-9.551,21.333-21.333,21.333C201.551,384,192,374.449,192,362.667v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M320,362.667c0,11.782-9.551,21.333-21.333,21.333c-11.782,0-21.333-9.551-21.333-21.333v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M174.315,85.333c9.074-25.551,33.238-42.634,60.352-42.667h42.667c27.114,0.033,51.278,17.116,60.352,42.667H174.315z" />
    </svg>
  );

  const successToastIcon = (
    <svg viewBox="0 0 24 24" className="size-[14px] shrink-0 fill-main-white" aria-hidden="true">
      <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm6.2,10.512l-4.426,4.345c-.783.768-1.791,1.151-2.8,1.151-.998,0-1.996-.376-2.776-1.129l-1.899-1.867c-.394-.387-.399-1.02-.012-1.414.386-.395,1.021-.4,1.414-.012l1.893,1.861c.776.75,2.001.746,2.781-.018l4.425-4.344c.393-.388,1.024-.381,1.414.013.387.394.381,1.027-.014,1.414Z" />
    </svg>
  );

  const failureToastIcon = (
    <svg viewBox="0 0 512 512" className="size-[14px] shrink-0 fill-main-white" aria-hidden="true">
      <path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256C511.847,114.678,397.322,0.153,256,0z M341.333,311.189c8.669,7.979,9.229,21.475,1.25,30.144c-7.979,8.669-21.475,9.229-30.144,1.25c-0.434-0.399-0.85-0.816-1.25-1.25L256,286.165l-55.168,55.168c-8.475,8.185-21.98,7.95-30.165-0.525c-7.984-8.267-7.984-21.373,0-29.64L225.835,256l-55.168-55.168c-8.185-8.475-7.95-21.98,0.525-30.165c8.267-7.984,21.373-7.984,29.64,0L256,225.835l55.189-55.168c7.979-8.669,21.475-9.229,30.144-1.25c8.669,7.979,9.229,21.475,1.25,30.144c-0.399,0.434-0.816,0.85-1.25,1.25L286.165,256L341.333,311.189z" />
    </svg>
  );

  // 여행 기록 관련 상태
  const records = useMemo(
    () =>
      myLogs.map((log, index) => ({
        id: index + 1,
        logId: log.id ?? "",
        title: log.title ?? "여행 기록",
        period: log.startDate ?? "",
      })),
    [myLogs],
  );
  const [selectedDeleteTripId, setSelectedDeleteTripId] = useState<number | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    icon: ReactNode;
  } | null>(null);

  // 삭제 모달
  const openDeleteModal = useCallback((tripId: number) => {
    setSelectedDeleteTripId(tripId);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setSelectedDeleteTripId(null);
  }, []);

  // 영수증 모달
  const openReceiptModal = useCallback((tripId: number) => {
    setSelectedTripId(tripId);
    setIsReceiptOpen(true);
  }, []);

  const closeReceiptModal = useCallback(() => {
    setIsReceiptOpen(false);
    setSelectedTripId(null);
  }, []);

  const selectedDeleteTrip = records.find((record) => record.id === selectedDeleteTripId) ?? null;

  const selectedLogId = records.find((record) => record.id === selectedTripId)?.logId ?? "";

  const { data: selectedTravelLog, isLoading: isReceiptLoading } = useQuery({
    queryKey: travelLogApi.keys.detail(selectedLogId),
    queryFn: () => travelLogApi.getLog(selectedLogId),
    enabled: isReceiptOpen && !!selectedLogId,
  });

  const { data: me } = useQuery({
    queryKey: userApi.keys.me(),
    queryFn: userApi.getMyProfile,
  });

  const selectedReceipt: ReceiptData | undefined =
    selectedTravelLog && me?.id && me?.nickname
      ? convertTripLogToReceipt(selectedTravelLog, me.id, me.nickname)
      : undefined;

  // 여행 기록 삭제
  const handleDelete = async () => {
    if (selectedDeleteTripId === null) return;

    const targetRecord = records.find((record) => record.id === selectedDeleteTripId);

    if (!targetRecord?.logId) return;

    await travelLogApi.deleteLog(targetRecord.logId);

    await queryClient.invalidateQueries({
      queryKey: travelLogApi.keys.mine(),
    });

    closeDeleteModal();

    setToast({
      message: "여행 기록이 삭제되었어요.",
      icon: deleteToastIcon,
    });
  };

  return (
    <section className="relative flex h-full flex-col gap-6">
      {/*상단 요약 카드 */}
      <Card variant="white" className="rounded-[25px]">
        <div className="px-5 py-2">
          <div className="flex items-center gap-2">
            <Image src={bookIcon} alt="여행 기록" width={55} height={55} />
            <div className="flex flex-col gap-1">
              <h1 className="font-ssurround text-lg text-text-heading">여행 기록</h1>
              <p className="text-md text-text-primary">부산에서 남긴 추억들을 모아봤어요.</p>
            </div>
          </div>

          <div className="my-5 border-t border-dashed border-sub-gray" />

          <div className="grid grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-1 border-r border-dashed border-sub-gray">
              <p className="text-sm font-bold text-text-primary">총 여행 기록</p>
              <p className="text-2xl font-bold text-sub-deepblue">
                {records.length}
                <span className="ml-1 text-sm text-text-primary">회</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-dashed border-sub-gray">
              <p className="text-sm font-bold text-text-primary">수집 관광지</p>
              <p className="text-2xl font-bold text-sub-deepblue">
                {collectedPlaceCount}
                <span className="ml-1 text-sm text-text-primary">곳</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-bold text-text-primary">최애 카테고리</p>
              {favoriteCategory ? (
                <CategoryChip category={favoriteCategory} />
              ) : (
                <span className="text-sm text-sub-gray">-</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 하단 여행 기록 */}
      <PageCard>
        <div className="flex flex-1 flex-col gap-5">
          {isLogsLoading && <LoadingState message="여행 기록을 불러오는 중이에요" />}

          {isLogsError && (
            <ErrorState
              title="여행 기록을 불러오지 못했어요"
              description="잠시 후 다시 시도해주세요."
              onRetry={() => refetchLogs()}
            />
          )}

          {!isLogsLoading && !isLogsError && records.length === 0 && (
            <EmptyState title="아직 저장된 여행 기록이 없어요" />
          )}

          {!isLogsLoading &&
            !isLogsError &&
            records.map((record) => (
              <TripRecordItem
                key={record.logId}
                id={record.id}
                title={record.title}
                period={record.period}
                onDelete={openDeleteModal}
                onTitleClick={openReceiptModal}
              />
            ))}
        </div>
      </PageCard>

      {/* 삭제 확인 모달 */}
      <RecordDeleteModal
        isOpen={selectedDeleteTrip !== null}
        tripName={selectedDeleteTrip?.title ?? ""}
        period={selectedDeleteTrip?.period ?? ""}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      {/* 여행 영수증 모달 */}
      <TripReceiptModal
        isOpen={isReceiptOpen && !isReceiptLoading}
        receipt={selectedReceipt}
        onDownloadComplete={() =>
          setToast({
            message: "영수증이 저장되었어요.",
            icon: successToastIcon,
          })
        }
        onDownloadError={() =>
          setToast({
            message: "영수증 저장에 실패했어요.",
            icon: failureToastIcon,
          })
        }
        onDetail={() => {
          if (selectedTripId === null) return;

          const selectedRecord = records.find((record) => record.id === selectedTripId);

          if (!selectedRecord?.logId) return;

          router.push(`/collection/records/log/${selectedRecord.logId}`);
        }}
        onClose={closeReceiptModal}
      />

      <Toast
        isVisible={toast !== null}
        onHide={() => setToast(null)}
        message={toast?.message ?? ""}
        icon={toast?.icon}
      />
    </section>
  );
}
