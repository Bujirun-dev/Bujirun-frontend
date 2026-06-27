"use client";

import Image from "next/image";

import { useMemo, useState, useCallback } from "react";
import { RecordDeleteModal } from "@/features/collection/components/RecordDeleteModal";
import { TripReceiptModal } from "@/features/collection/components/TripReceiptModal";

import bookIcon from "@/assets/icons/collection/book.png";
import { Card, CategoryChip, PageCard, Toast } from "@/components";
import type { Category } from "@/components/ui/CategoryChip";
import { TripRecordItem } from "@/features/collection/components/TripRecordItem";
import { PLACES } from "@/features/collection/data/places";
import { TRIP_RECORDS } from "@/features/collection/data/tripRecords";

export default function CollectionRecordsPage() {
  // 수집된 장소 목록
  const collectedPlaces = useMemo(() => PLACES.filter((place) => place.isCollected), []);
  const collectedPlaceCount = collectedPlaces.length;

  // 최애 카테고리 계산
  const favoriteCategory = useMemo(() => {
    const count = collectedPlaces.reduce<Partial<Record<Category, number>>>((acc, place) => {
      const category = place.category as Category;
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(count).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as
      | Category
      | undefined;
  }, [collectedPlaces]);

  const [records, setRecords] = useState(TRIP_RECORDS);
  const [selectedDeleteTripId, setSelectedDeleteTripId] = useState<number | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  // 현재 선택된 여행 기록 (모달에 전달)
  const selectedDeleteTrip = records.find((record) => record.id === selectedDeleteTripId) ?? null;

  // 여행 기록 삭제
  const handleDelete = () => {
    if (selectedDeleteTripId === null) return;

    setRecords((prevRecords) => prevRecords.filter((record) => record.id !== selectedDeleteTripId));
    closeDeleteModal();
    setToastMessage("여행 기록이 삭제되었어요.");
  };

  return (
    <section className="relative flex h-full flex-col gap-6">
      {/*상단 요약 카드 */}
      <Card variant="white" className="rounded-[25px]">
        <div className="px-5 py-2">
          {/* 상단 */}
          <div className="flex items-center gap-2">
            <Image src={bookIcon} alt="여행 기록" width={55} height={55} />
            <div className="flex flex-col gap-1">
              <h1 className="font-ssurround text-lg text-text-heading">여행 기록</h1>
              <p className="text-md text-text-primary">부산에서 남긴 추억들을 모아봤어요.</p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-5 border-t border-dashed border-sub-gray" />

          {/* 하단 */}
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
      <PageCard className="px-6 pt-8 pb-4">
        <div className="flex flex-col gap-5">
          {records.map((record) => (
            <TripRecordItem
              key={record.id}
              id={record.id}
              title={record.title}
              period={record.period}
              onDelete={openDeleteModal}
              onTitleClick={openReceiptModal}
            />
          ))}
        </div>
      </PageCard>

      <RecordDeleteModal
        isOpen={selectedDeleteTrip !== null}
        tripName={selectedDeleteTrip?.title ?? ""}
        period={selectedDeleteTrip?.period ?? ""}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
      <TripReceiptModal
        isOpen={isReceiptOpen}
        tripId={selectedTripId ?? 0}
        onClose={closeReceiptModal}
      />

      <Toast
        isVisible={toastMessage !== ""}
        onHide={() => setToastMessage("")}
        message={toastMessage}
        icon={
          <svg
            viewBox="0 0 512 512"
            className="size-[14px] shrink-0 fill-main-white"
            aria-hidden="true"
          >
            <path d="M448,85.333h-66.133C371.66,35.703,328.002,0.064,277.333,0h-42.667c-50.669,0.064-94.327,35.703-104.533,85.333H64c-11.782,0-21.333,9.551-21.333,21.333S52.218,128,64,128h21.333v277.333C85.404,464.214,133.119,511.93,192,512h128c58.881-0.07,106.596-47.786,106.667-106.667V128H448c11.782,0,21.333-9.551,21.333-21.333S459.782,85.333,448,85.333z M234.667,362.667c0,11.782-9.551,21.333-21.333,21.333C201.551,384,192,374.449,192,362.667v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M320,362.667c0,11.782-9.551,21.333-21.333,21.333c-11.782,0-21.333-9.551-21.333-21.333v-128c0-11.782,9.551-21.333,21.333-21.333c11.782,0,21.333,9.551,21.333,21.333V362.667z M174.315,85.333c9.074-25.551,33.238-42.634,60.352-42.667h42.667c27.114,0.033,51.278,17.116,60.352,42.667H174.315z" />
          </svg>
        }
      />
    </section>
  );
}
