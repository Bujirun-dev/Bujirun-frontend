"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import plusSmallIcon from "@/assets/icons/itinerary/plus-small.svg?url";
import { PageCard, Toast } from "@/components";
import { TripCard, TripEditModal, TripDeleteModal, TripDeleteToast } from "@/features/itinerary";
import type { Trip } from "@/features/itinerary";
import { itineraryApi } from "@/shared/api/domains";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}

type ModalState = { type: "edit"; trip: Trip } | { type: "delete"; trip: Trip } | null;

function toTripDate(apiDate?: string): string {
  if (!apiDate) {
    const today = new Date();
    return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} 00:00`;
  }
  return `${apiDate.replaceAll("-", ".")} 00:00`;
}

function toApiDate(tripDate: string): string {
  return tripDate.split(" ")[0].replaceAll(".", "-");
}

export default function TripsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: summaries } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });

  // 목록 API엔 여행 기간이 없어서, 카드에 표시할 기간은 상세 조회로 보충한다.
  const detailQueries = useQueries({
    queries: (summaries ?? []).map((s) => ({
      queryKey: itineraryApi.keys.detail(s.id ?? ""),
      queryFn: () => itineraryApi.getItinerary(s.id as string),
      enabled: !!s.id,
    })),
  });

  const trips: Trip[] = (summaries ?? []).map((s, idx) => {
    const detail = detailQueries[idx]?.data;
    return {
      id: s.id ?? "",
      name: s.title ?? "제목 없음",
      startDate: toTripDate(detail?.startAt),
      endDate: toTripDate(detail?.endAt),
    };
  });

  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: itineraryApi.keys.all });
  };

  const handleSelect = useCallback(
    (id: string) => {
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

  const handleEditConfirm = useCallback(
    async (updated: Trip) => {
      setModal(null);
      try {
        await itineraryApi.updateItinerary(updated.id, {
          title: updated.name,
          startAt: toApiDate(updated.startDate),
          endAt: toApiDate(updated.endDate),
        });
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "여행 수정에 실패했어요. 다시 시도해주세요."));
      } finally {
        invalidateTrips();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (modal?.type !== "delete") return;
    const tripId = modal.trip.id;
    setModal(null);
    try {
      await itineraryApi.deleteItinerary(tripId);
      setShowDeleteToast(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "여행 삭제에 실패했어요. 다시 시도해주세요."));
    } finally {
      invalidateTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <Toast
        isVisible={errorMessage !== null}
        message={errorMessage ?? ""}
        onHide={() => setErrorMessage(null)}
      />
    </PageCard>
  );
}
