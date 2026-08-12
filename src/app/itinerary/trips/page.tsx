"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import plusSmallIcon from "@/assets/icons/itinerary/plus-small.svg?url";
import { PageCard, Toast, EmptyState, LoadingState } from "@/components";
import { TripCard, TripEditModal, TripDeleteModal, TripDeleteToast } from "@/features/itinerary";
import type { Trip } from "@/features/itinerary";
import { itineraryApi } from "@/shared/api/domains";
import { getErrorMessage } from "@/shared/utils";

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
  const [completedAction, setCompletedAction] = useState<"delete" | "leave" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: summaries, isLoading } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });

  const trips: Trip[] = (summaries ?? []).map((summary) => ({
    id: summary.id ?? "",
    name: summary.title ?? "제목 없음",
    startDate: toTripDate(summary.startAt),
    endDate: toTripDate(summary.endAt),
    groupId: summary.groupId,
  }));

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
    const { id: tripId, groupId } = modal.trip;
    setModal(null);
    try {
      // 그룹 일정은 다른 참여자의 일정에 영향을 주지 않도록 삭제가 아닌 나가기로 처리한다.
      if (groupId) {
        await itineraryApi.leaveItinerary(tripId);
        setCompletedAction("leave");
      } else {
        await itineraryApi.deleteItinerary(tripId);
        setCompletedAction("delete");
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          groupId
            ? "여행 일정에서 나가지 못했어요. 다시 시도해주세요."
            : "여행 삭제에 실패했어요. 다시 시도해주세요.",
        ),
      );
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
        className="absolute top-[28px] right-[32px] size-[24px] rounded-lg bg-sub-coral flex items-center justify-center active:opacity-80 z-10"
        onClick={() => router.push("/itinerary/trips/new")}
      >
        <Image
          src={plusSmallIcon}
          alt=""
          width={20}
          height={20}
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
        {isLoading ? (
          <LoadingState message="여행 목록을 불러오는 중이에요" />
        ) : trips.length === 0 ? (
          <EmptyState
            title="아직 여행이 없어요"
            description="오른쪽 위 + 버튼으로 새 여행을 만들어보세요"
            actionLabel="+ 여행 만들기"
            onAction={() => router.push("/itinerary/trips/new")}
          />
        ) : (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
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
          isGroupTrip={Boolean(modal.trip.groupId)}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* 삭제 토스트 */}
      <TripDeleteToast action={completedAction} onHide={() => setCompletedAction(null)} />

      <Toast
        isVisible={errorMessage !== null}
        message={errorMessage ?? ""}
        onHide={() => setErrorMessage(null)}
      />
    </PageCard>
  );
}
