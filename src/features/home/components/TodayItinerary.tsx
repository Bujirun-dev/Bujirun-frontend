"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { travelLogApi } from "@/shared/api/domains";
import { useQuery } from "@tanstack/react-query";
import { Card, StatusBadge, EmptyState, LoadingBoundary } from "@/components";
import { useTodayItinerary } from "@/features/home/hooks/useTodayItinerary";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { TransportSummaryCard } from "@/features/home/components/TransportSummaryCard";
import { TransportDetailModal } from "@/features/home/components/TransportDetailModal";
import { ArrivalVerifyModal } from "@/features/itinerary/components/ArrivalVerifyModal";
import { openKakaoMapRoute } from "@/features/itinerary/components/TransportSelectSheet";
import { getSelectedTransportOption } from "@/features/home/data/sampleTransport";
import { isReviewSkipped } from "@/shared/utils/skippedReviews";
import type {
  TransportGroup,
  TransportOption,
  TransportStep,
} from "@/features/home/types/transport";
import type { TransportType } from "@/features/home/components/TransportIcons";

const getTransportRouteKey = (transportGroup: TransportGroup) =>
  `${transportGroup.fromPlace}-${transportGroup.toPlace}`;

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

// 모달이 닫혀있을 때 TransportDetailModal의 non-null prop을 채우기 위한 빈 값.
// 실제로 화면에 보이지 않으므로 내용은 의미 없다.
const EMPTY_TRANSPORT_GROUP: TransportGroup = {
  fromPlace: "",
  toPlace: "",
  selectedOptionId: "actual",
  options: [],
};

interface TransitLegSource {
  travelMode?: string;
  travelTimeMin?: number;
  routeType?: string;
  routeNo?: string;
  startStationName?: string;
  endStationName?: string;
  startArsId?: string;
}

// routeType(ODsay 원본 한글값)을 우선 쓰고, 없으면 travelMode(walk/transit/taxi)로부터 추정한다.
// 어느 쪽도 없으면(도보/택시 여부조차 알 수 없음) null — 이 경우 화면엔 "교통정보 없음"으로 표시한다.
function resolveTransportType(leg?: TransitLegSource): TransportType | null {
  if (
    leg?.routeType === "버스" ||
    leg?.routeType === "지하철" ||
    leg?.routeType === "도보" ||
    leg?.routeType === "택시"
  ) {
    return leg.routeType;
  }
  if (leg?.travelMode === "walk") return "도보";
  if (leg?.travelMode === "taxi") return "택시";
  if (leg?.travelMode === "transit") return "버스";
  return null;
}

// 두 스팟 사이의 실제 이동 정보(백엔드가 ODsay로 계산해 저장한 값)로 TransportGroup을 만든다.
// 도착 스팟(nextPlan) 쪽에 이전 스팟까지의 구간 정보가 저장되어 있다.
// 저장된 값이 없으면 null을 반환해 "교통정보 없음"으로 표시하고, 가짜 역명을 보여주지 않는다.
function buildTransportGroup(
  fromPlace: string,
  toPlace: string,
  leg?: TransitLegSource,
): TransportGroup | null {
  const type = resolveTransportType(leg);
  if (!type) return null;

  const routeName = type === "도보" || type === "택시" ? type : (leg?.routeNo ?? type);

  const step: TransportStep = {
    type,
    routeName,
    from: leg?.startStationName ?? fromPlace,
    to: leg?.endStationName ?? toPlace,
    arsId: leg?.startArsId,
    routeNo: leg?.routeNo,
  };

  const option: TransportOption = {
    id: "actual",
    durationText: leg?.travelTimeMin != null ? `${leg.travelTimeMin}분` : "-",
    costText: "-",
    isRecommended: true,
    steps: [step],
  };

  return {
    fromPlace,
    toPlace,
    selectedOptionId: "actual",
    options: [option],
  };
}

export function TodayItinerary() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasRedirectedToReviewRef = useRef(false);
  const {
    itinerary,
    completedItineraries,
    day,
    date,
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

      // 로그가 없어도 사용자가 이 일정에 대한 영수증 팝업을 이미 취소한 적 있으면
      // 다시 자동으로 띄우지 않는다 — 그렇지 않으면 취소 → 홈 재진입 → 같은 팝업이
      // 다시 뜨는 무한루프가 됨(아직 수동으로 영수증 발행을 다시 시작할 진입로가 없어서,
      // 이 자동 리다이렉트가 사실상 유일한 진입로였음).
      return !log?.hasLog && !isReviewSkipped(itinerary.id);
    });

    if (!reviewTarget) return;

    hasRedirectedToReviewRef.current = true;

    router.replace(`/home/review?itineraryId=${reviewTarget.id}`);
  }, [completedItineraries, logExists, router]);

  if (isError || !hasSchedule || !day || plans.length === 0) {
    return (
      <LoadingBoundary isLoading={isLoading} message="오늘의 일정을 불러오는 중이에요">
        <div>
          <div className="flex items-end gap-3">
            <h2 className="font-ssurround text-lg text-text-heading">오늘의 일정</h2>
          </div>

          <Card variant="glass-sm" className="relative mt-4 min-h-[140px]">
            <EmptyState
              variant="compact"
              title="아직 여행 일정이 없어요!"
              description="친구들과 부산 여행을 시작해보세요!"
              primaryAction={{
                label: "여행 시작하기",
                onClick: handleStartTrip,
              }}
            />
          </Card>
        </div>
      </LoadingBoundary>
    );
  }

  return (
    <LoadingBoundary isLoading={isLoading} message="오늘의 일정을 불러오는 중이에요">
      <div>
        <div className="flex items-end gap-3">
          <h2 className="font-ssurround text-lg text-text-heading">오늘의 일정</h2>
          <p className="font-paperlogy text-sm font-semibold text-sub-darkgray">
            {formatDate(date ?? "")}
          </p>
        </div>
        <ol className="mt-4">
          {plans.map((plan, index) => {
            const spotId = plan.spot?.id;
            const placeName = plan.spot?.name ?? "이름 없는 장소";
            const isVisited = plan.spot?.visited ?? false;
            const nextPlan = plans[index + 1];
            const nextPlaceName = nextPlan?.spot?.name;
            // 이동 정보는 도착 스팟(nextPlan)에 저장된 실제 값을 그대로 쓴다.
            const transportGroup = nextPlaceName
              ? buildTransportGroup(placeName, nextPlaceName, nextPlan)
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
                    {transportGroup && selectedOption ? (
                      <button
                        type="button"
                        className="my-3 w-full text-left"
                        onClick={() => openTransportModal(transportGroup)}
                      >
                        <TransportSummaryCard {...selectedOption} />
                      </button>
                    ) : (
                      nextPlaceName && (
                        <p className="my-3 text-sm text-sub-darkgray">교통정보 없음</p>
                      )
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
          transportGroup={selectedTransportGroup ?? EMPTY_TRANSPORT_GROUP}
          selectedOptionId={
            selectedTransportGroup
              ? (selectedOptionIdByRoute[getTransportRouteKey(selectedTransportGroup)] ??
                selectedTransportGroup.selectedOptionId)
              : EMPTY_TRANSPORT_GROUP.selectedOptionId
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
    </LoadingBoundary>
  );
}
