"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { travelLogApi } from "@/shared/api/domains";
import { useQuery } from "@tanstack/react-query";
import { Card, StatusBadge, LoadingState, EmptyState } from "@/components";
import { useTodayItinerary } from "@/features/home/hooks/useTodayItinerary";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { TransportSummaryCard } from "@/features/home/components/TransportSummaryCard";
import { TransportDetailModal } from "@/features/home/components/TransportDetailModal";
import { ArrivalVerifyModal } from "@/features/itinerary/components/ArrivalVerifyModal";
import { openKakaoMapRoute } from "@/features/itinerary/components/TransportSelectSheet";
import {
  DEFAULT_TRANSPORT_GROUP,
  findTransportGroupByPlaces,
  getSelectedTransportOption,
} from "@/features/home/data/sampleTransport";
import type { TransportGroup, TransportOption } from "@/features/home/types/transport";

const getTransportRouteKey = (transportGroup: TransportGroup) =>
  `${transportGroup.fromPlace}-${transportGroup.toPlace}`;

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

export function TodayItinerary() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasRedirectedToReviewRef = useRef(false);
  const {
    itinerary,
    completedItineraries,
    day,
    items: plans,
    hasSchedule,
    isLoading,
    isError,
  } = useTodayItinerary();
  const completedItineraryIds = completedItineraries.map((itinerary) => itinerary.id);
  const { data: logExists } = useQuery({
    queryKey: [...travelLogApi.keys.all, "exists", completedItineraryIds],
    queryFn: () => travelLogApi.checkLogExists(completedItineraryIds),
    enabled: !!accessToken && completedItineraryIds.length > 0,
  });
  const [selectedTransportGroup, setSelectedTransportGroup] = useState<TransportGroup | null>(null);
  const [selectedVerifySpot, setSelectedVerifySpot] = useState<{
    spotId: string;
    placeName: string;
  } | null>(null);
  const [selectedOptionIdByRoute, setSelectedOptionIdByRoute] = useState<Record<string, string>>(
    {},
  );

  const openTransportModal = (transportGroup: TransportGroup) => {
    setSelectedTransportGroup(transportGroup);
  };

  const closeTransportModal = () => setSelectedTransportGroup(null);

  const openVerifyModal = (spotId: string, placeName: string) => {
    setSelectedVerifySpot({
      spotId,
      placeName,
    });
  };

  const closeVerifyModal = () => {
    setSelectedVerifySpot(null);
  };

  const handleChangeTransportOption = (option: TransportOption) => {
    if (!selectedTransportGroup) return;

    setSelectedOptionIdByRoute((prev) => ({
      ...prev,
      [getTransportRouteKey(selectedTransportGroup)]: option.id,
    }));
  };

  const handleStartTrip = () => {
    router.push("/itinerary/trips/new");
  };

  useEffect(() => {
    if (hasRedirectedToReviewRef.current) return;
    if (!logExists) return;

    const reviewTarget = completedItineraries.find((itinerary) => {
      const log = logExists.find((item) => item.itineraryId === itinerary.id);

      return !log?.hasLog;
    });

    if (!reviewTarget) return;

    hasRedirectedToReviewRef.current = true;

    router.replace(`/home/review?itineraryId=${reviewTarget.id}`);
  }, [completedItineraries, logExists, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] flex-col">
        <LoadingState message="오늘의 일정을 불러오는 중이에요" />
      </div>
    );
  }

  if (isError || !hasSchedule || !day) {
    return (
      <div>
        <div className="flex items-end gap-3">
          <h2 className="font-ssurround text-lg text-text-heading">오늘의 일정</h2>
        </div>

        <Card variant="glass-sm" className="mt-4">
          <EmptyState
            size="sm"
            title="아직 여행 일정이 없어요!"
            description="친구들과 부산 여행을 시작해보세요!"
            actionLabel="여행 시작하기"
            onAction={handleStartTrip}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <h2 className="font-ssurround text-lg text-text-heading">오늘의 일정</h2>
        <p className="font-paperlogy text-sm font-semibold text-sub-darkgray">
          {formatDate(day.date ?? "")}
        </p>
      </div>

      <ol className="mt-4">
        {plans.map((plan, index) => {
          const spotId = plan.spot?.id;
          const placeName = plan.spot?.name ?? "이름 없는 장소";
          const isVisited = plan.spot?.visited ?? false;
          const nextPlan = plans[index + 1];
          const nextPlaceName = nextPlan?.spot?.name;
          const matchedTransportGroup = nextPlaceName
            ? findTransportGroupByPlaces(placeName, nextPlaceName)
            : null;

          // TODO: 교통수단 API 연동 전 임시 처리
          // 샘플 데이터에 현재 장소 조합이 없어도 일정 사이에 교통수단 카드를 표시한다.
          const transportGroup = nextPlaceName
            ? (matchedTransportGroup ?? {
                ...DEFAULT_TRANSPORT_GROUP,
                fromPlace: placeName,
                toPlace: nextPlaceName,
              })
            : null;
          const selectedOptionId = transportGroup
            ? (selectedOptionIdByRoute[getTransportRouteKey(transportGroup)] ??
              transportGroup.selectedOptionId)
            : undefined;
          const selectedOption = transportGroup
            ? getSelectedTransportOption(transportGroup, selectedOptionId)
            : null;

          return (
            <li
              key={plan.id ?? `${placeName}-${index}`}
              className="relative flex items-start justify-between gap-2"
            >
              {index < plans.length - 1 && (
                <span
                  className="absolute left-[7.5px] top-[30px] bottom-[-15px] w-px bg-sub-gray"
                  aria-hidden="true"
                />
              )}

              <div className="flex min-w-0 flex-1 items-start gap-3 pt-[7px]">
                <span
                  className={
                    isVisited
                      ? "size-4 shrink-0 rounded-full bg-main-blue"
                      : "size-4 shrink-0 rounded-full bg-sub-pink"
                  }
                />

                <div className="min-w-0 flex-1">
                  <p className="leading-4 text-md font-medium text-text-primary">{placeName}</p>
                  {transportGroup && selectedOption && (
                    <button
                      type="button"
                      className="my-3 w-full text-left"
                      onClick={() => openTransportModal(transportGroup)}
                    >
                      <TransportSummaryCard {...selectedOption} />
                    </button>
                  )}
                </div>
              </div>

              {isVisited ? (
                <StatusBadge
                  status="completed"
                  className="mt-[7px] shrink-0 px-2.5 py-1.5 text-sm"
                />
              ) : (
                <button
                  type="button"
                  className="mt-[7px] shrink-0"
                  onClick={() => {
                    if (!spotId || !plan.id) return;

                    openVerifyModal(spotId, placeName);
                  }}
                >
                  <StatusBadge status="verify" className="px-2.5 py-1.5 text-sm" />
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <TransportDetailModal
        isOpen={selectedTransportGroup !== null}
        transportGroup={selectedTransportGroup ?? DEFAULT_TRANSPORT_GROUP}
        selectedOptionId={
          selectedTransportGroup
            ? (selectedOptionIdByRoute[getTransportRouteKey(selectedTransportGroup)] ??
              selectedTransportGroup.selectedOptionId)
            : DEFAULT_TRANSPORT_GROUP.selectedOptionId
        }
        onClose={closeTransportModal}
        onChange={handleChangeTransportOption}
        onKakaoMapClick={() =>
          selectedTransportGroup &&
          openKakaoMapRoute(selectedTransportGroup.fromPlace, selectedTransportGroup.toPlace)
        }
      />
      {selectedVerifySpot && itinerary?.id && (
        <ArrivalVerifyModal
          spotId={selectedVerifySpot.spotId}
          itineraryId={itinerary.id}
          isOpen
          placeName={selectedVerifySpot.placeName}
          onClose={closeVerifyModal}
          onVerify={closeVerifyModal}
          onLater={closeVerifyModal}
        />
      )}
    </div>
  );
}
