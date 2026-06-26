"use client";

import Image from "next/image";

import { useState } from "react";
import { RecordDeleteModal } from "@/features/collection/components/RecordDeleteModal";

import bookIcon from "@/assets/icons/collection/book.png";
import successIcon from "@/assets/icons/mypage/success.svg";
import { Card, CategoryChip, PageCard, Toast } from "@/components";
import type { Category } from "@/components/ui/CategoryChip";
import { TripRecordItem } from "@/features/collection/components/TripRecordItem";
import { PLACES } from "@/features/collection/data/places";
import { TRIP_RECORDS } from "@/features/collection/data/tripRecords";

export default function CollectionRecordsPage() {
  const collectedPlaces = PLACES.filter((place) => place.isCollected);
  const collectedPlaceCount = collectedPlaces.length;

  const favoriteCategoryCount = collectedPlaces.reduce<Partial<Record<Category, number>>>(
    (acc, place) => {
      const category = place.category as Category;
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const favoriteCategory = Object.entries(favoriteCategoryCount).sort(
    ([, countA], [, countB]) => (countB ?? 0) - (countA ?? 0),
  )[0]?.[0] as Category | undefined;

  const [records, setRecords] = useState(TRIP_RECORDS);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openDeleteModal = (tripId: number) => {
    setSelectedTripId(tripId);
  };

  const closeDeleteModal = () => {
    setSelectedTripId(null);
  };

  const selectedTrip = records.find((record) => record.id === selectedTripId) ?? null;

  const handleDelete = () => {
    if (selectedTripId === null) return;

    setRecords((prevRecords) => prevRecords.filter((record) => record.id !== selectedTripId));
    closeDeleteModal();
    setToastMessage("여행 기록이 삭제되었어요.");
  };

  return (
    <section className="flex h-full flex-col gap-6">
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

      <PageCard className="px-6 pt-8 pb-4">
        <div className="flex flex-col gap-5">
          {records.map((record) => (
            <TripRecordItem
              key={record.id}
              title={record.title}
              period={record.period}
              onDelete={() => openDeleteModal(record.id)}
            />
          ))}
        </div>
      </PageCard>

      <RecordDeleteModal
        isOpen={selectedTrip !== null}
        tripName={selectedTrip?.title ?? ""}
        period={selectedTrip?.period ?? ""}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <Toast
        isVisible={toastMessage !== null}
        onHide={() => setToastMessage(null)}
        message={toastMessage ?? ""}
        icon={
          <Image
            src={successIcon}
            alt="완료"
            width={12}
            height={12}
            className="brightness-0 invert"
          />
        }
      />
    </section>
  );
}
