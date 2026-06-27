"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlusSmallIcon from "@/assets/icons/itinerary/plus-small.svg";
import { PageCard } from "@/components";
import { TripCard, TripEditModal, TripDeleteModal, TripDeleteToast } from "@/features/itinerary";
import type { Trip } from "@/features/itinerary";

// TODO: API 연동 시 이 데이터를 fetch로 교체
const MOCK_TRIPS: Trip[] = [
  { id: "1", name: "부지렁즈", startDate: "2026.05.18", endDate: "2026.05.20" },
  { id: "2", name: "여행 이름", startDate: "2026.05.18", endDate: "2026.05.20" },
  { id: "3", name: "여행 이름", startDate: "2026.05.18", endDate: "2026.05.20" },
];

type ModalState = { type: "edit"; trip: Trip } | { type: "delete"; trip: Trip } | null;

export default function TripsPage() {
  const router = useRouter();
  // TODO: API 연동 시 useState 초기값을 빈 배열로 바꾸고 useEffect로 fetch
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [modal, setModal] = useState<ModalState>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      // TODO: API 연동 시 선택된 tripId를 전역 상태/URL 파라미터로 전달
      router.push(`/itinerary?tripId=${id}`);
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      const trip = trips.find((t) => t.id === id);
      if (trip) setModal({ type: "edit", trip });
    },
    [trips],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const trip = trips.find((t) => t.id === id);
      if (trip) setModal({ type: "delete", trip });
    },
    [trips],
  );

  const handleEditConfirm = useCallback((updated: Trip) => {
    // TODO: API 연동 시 PATCH /trips/:id 호출
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setModal(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (modal?.type !== "delete") return;
    // TODO: API 연동 시 DELETE /trips/:id 호출
    setTrips((prev) => prev.filter((t) => t.id !== modal.trip.id));
    setModal(null);
    setShowDeleteToast(true);
  }, [modal]);

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <PageCard className="relative">
      {/* + 버튼 */}
      <button
        className="absolute top-[28px] right-[32px] size-[28px] rounded-lg bg-sub-coral flex items-center justify-center active:opacity-80 z-10"
        onClick={() => {}}
      >
        <PlusSmallIcon width={24} height={24} className="fill-white" aria-hidden />
      </button>

      {/* 헤더 */}
      <div className="flex items-center justify-center pb-6">
        <span className="font-ssurround font-bold text-lg text-text-heading">여행 목록</span>
      </div>

      {/* 여행 목록 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-3.5">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 수정 모달 */}
      {modal?.type === "edit" && (
        <TripEditModal
          key={modal.trip.id}
          isOpen
          trip={modal.trip}
          onClose={closeModal}
          onConfirm={handleEditConfirm}
        />
      )}

      {/* 삭제 모달 */}
      {modal?.type === "delete" && (
        <TripDeleteModal
          isOpen
          tripName={modal.trip.name}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* 삭제 토스트 */}
      <TripDeleteToast isVisible={showDeleteToast} onHide={() => setShowDeleteToast(false)} />
    </PageCard>
  );
}
