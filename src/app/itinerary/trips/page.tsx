"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import plusSmallIcon from "@/assets/icons/itinerary/plus-small.svg?url";
import { PageCard, Toast, EmptyState, LoadingBoundary } from "@/components";
import { TripCard, TripEditModal, TripDeleteModal, TripDeleteToast } from "@/features/itinerary";
import type { Trip } from "@/features/itinerary";
import { itineraryApi } from "@/shared/api/domains";
import { getErrorMessage } from "@/shared/utils";

type ModalState = { type: "edit"; trip: Trip } | { type: "delete"; trip: Trip } | null;

// apiTime이 없으면(옛날 트립 등 아직 시간이 저장 안 된 경우에만) 00:00으로 대체한다 —
// 실제 저장된 시간이 있는데 여기서 무시하고 00:00을 보여주면, 사용자가 이름/날짜만
// 고치고 저장해도 진짜 시작/종료 시간이 조용히 자정으로 덮어써진다.
function toTripDate(apiDate?: string, apiTime?: string): string {
  if (!apiDate) {
    const today = new Date();
    return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} ${apiTime ?? "00:00"}`;
  }
  return `${apiDate.replaceAll("-", ".")} ${apiTime ?? "00:00"}`;
}

function toApiDate(tripDate: string): string {
  return tripDate.split(" ")[0].replaceAll(".", "-");
}

// "YYYY.MM.DD HH:mm"에서 시간만 뽑아낸다
function toApiTime(tripDate: string): string {
  return tripDate.split(" ")[1] ?? "00:00";
}

// 종료일이 어제 이전인 일정만 목록에서 숨긴다. 데이터는 삭제하지 않으며,
// 오늘 종료되는 일정은 하루가 끝날 때까지 계속 보여준다.
function isPastTrip(endAt?: string): boolean {
  if (!endAt) return false;

  const [year, month, day] = endAt.split("-").map(Number);
  if (!year || !month || !day) return false;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tripEndDate = new Date(year, month - 1, day);
  return tripEndDate < todayStart;
}

export default function TripsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [completedAction, setCompletedAction] = useState<"delete" | "leave" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const { data: summaries, isLoading } = useQuery({
    queryKey: itineraryApi.keys.lists(),
    queryFn: itineraryApi.getItineraries,
  });

  const trips: Trip[] = (summaries ?? [])
    .filter((summary) => !isPastTrip(summary.endAt))
    .map((summary) => ({
      id: summary.id ?? "",
      name: summary.title ?? "제목 없음",
      startDate: toTripDate(summary.startAt, summary.startTime),
      endDate: toTripDate(summary.endAt, summary.endTime),
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
    async (id: string) => {
      const trip = trips.find((t) => t.id === id);
      if (!trip) return;

      try {
        // 목록 응답의 시간 필드가 비어 있는 구버전/캐시 응답에서도 생성 당시 시간이
        // 00:00으로 덮이지 않도록, 수정 직전에 상세 API 값을 기준으로 모달을 연다.
        const detail = await queryClient.fetchQuery({
          queryKey: itineraryApi.keys.detail(id),
          queryFn: () => itineraryApi.getItinerary(id),
        });
        setModal({
          type: "edit",
          trip: {
            ...trip,
            name: detail.title ?? trip.name,
            startDate: toTripDate(detail.startAt, detail.startTime),
            endDate: toTripDate(detail.endAt, detail.endTime),
          },
        });
      } catch {
        setErrorMessage("여행 정보를 불러오지 못했어요. 다시 시도해주세요.");
      }
    },
    [queryClient, trips],
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
      const startAt = toApiDate(updated.startDate);
      const endAt = toApiDate(updated.endDate);
      const startTime = toApiTime(updated.startDate);
      const endTime = toApiTime(updated.endDate);
      const previousStartTime = queryClient
        .getQueryData<typeof summaries>(itineraryApi.keys.lists())
        ?.find((summary) => summary.id === updated.id)?.startTime;
      // 시작 시간이 실제로 밀렸으면 백엔드가 이후 일정들의 방문 시각도 같은 만큼 밀어준다
      // (ItineraryService.update 참고) — 사용자가 그걸 모르고 넘어가지 않게 안내한다.
      const timeShifted = Boolean(previousStartTime) && previousStartTime !== startTime;

      // 네트워크 응답을 기다리지 않고 목록에 바로 반영 — 실패하면 finally의 invalidate가
      // 서버 값으로 다시 맞춰준다.
      queryClient.setQueryData<typeof summaries>(itineraryApi.keys.lists(), (prev) =>
        prev?.map((summary) =>
          summary.id === updated.id
            ? { ...summary, title: updated.name, startAt, startTime, endAt, endTime }
            : summary,
        ),
      );

      try {
        await itineraryApi.updateItinerary(updated.id, {
          title: updated.name,
          startAt,
          endAt,
          startTime,
          endTime,
        });
        if (timeShifted) {
          setInfoMessage("시작 시간이 바뀌어서 이후 일정 시간도 함께 조정됐어요.");
        }
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
      <LoadingBoundary isLoading={isLoading} message="여행 목록을 불러오는 중이에요">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col gap-3.5">
          {trips.length === 0 ? (
            <EmptyState
              title="아직 여행이 없어요"
              description="오른쪽 위 (+) 버튼으로 새 여행을 만들어보세요"
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
      </LoadingBoundary>

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
        onHide={() => setErrorMessage(null)}
        message={errorMessage ?? ""}
        variant="error"
      />
      <Toast
        isVisible={infoMessage !== null}
        onHide={() => setInfoMessage(null)}
        message={infoMessage ?? ""}
        variant="success"
      />
    </PageCard>
  );
}
