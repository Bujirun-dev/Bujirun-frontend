"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import plusSmallIcon from "@/assets/icons/itinerary/plus-small.svg?url";
import { PageCard } from "@/components";
import { TripCard, TripEditModal, TripDeleteModal, TripDeleteToast } from "@/features/itinerary";
import type { Trip } from "@/features/itinerary";

// TODO: API 연동 시 이 데이터를 fetch로 교체
const MOCK_TRIPS: Trip[] = [
  { id: "1", name: "부지렁즈", startDate: "2026.05.18", endDate: "2026.05.20" },
  { id: "2", name: "영도 감성 코스", startDate: "2026.06.02", endDate: "2026.06.03" },
  { id: "3", name: "기장 바다 드라이브", startDate: "2026.06.14", endDate: "2026.06.15" },
  { id: "4", name: "서면 문화 탐방", startDate: "2026.06.22", endDate: "2026.06.22" },
  { id: "5", name: "낙동강 노을 산책", startDate: "2026.07.03", endDate: "2026.07.04" },
  { id: "6", name: "오시리아 체험 여행", startDate: "2026.08.01", endDate: "2026.08.02" },
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
        onClick={() => router.push("/itinerary/trips/new")}
      >
        <Image
          src={plusSmallIcon}
          alt=""
          width={24}
          height={24}
          className="brightness-0 invert"
          aria-hidden
        />
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
