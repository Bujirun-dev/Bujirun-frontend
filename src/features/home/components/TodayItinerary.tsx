"use client";
import { useState } from "react";
import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";
import { StatusBadge } from "@/components";
import { getClosestDay } from "@/features/home/utils/getClosestDay";
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

export function TodayItinerary() {
  const { day } = getClosestDay(SAMPLE_LOGS);
  const plans = day.stops;
  const [selectedTransportGroup, setSelectedTransportGroup] = useState<TransportGroup | null>(null);
  const [selectedVerifyPlaceName, setSelectedVerifyPlaceName] = useState<string | null>(null);
  const [verifiedPlaceNames, setVerifiedPlaceNames] = useState<Set<string>>(() => new Set());
  const [selectedOptionIdByRoute, setSelectedOptionIdByRoute] = useState<Record<string, string>>(
    {},
  );

  const openTransportModal = (transportGroup: TransportGroup) => {
    setSelectedTransportGroup(transportGroup);
  };

  const closeTransportModal = () => setSelectedTransportGroup(null);

  const openVerifyModal = (placeName: string) => {
    setSelectedVerifyPlaceName(placeName);
  };

  const closeVerifyModal = () => {
    setSelectedVerifyPlaceName(null);
  };

  const handleVerifyPlace = () => {
    if (!selectedVerifyPlaceName) return;

    setVerifiedPlaceNames((prev) => {
      const next = new Set(prev);
      next.add(selectedVerifyPlaceName);
      return next;
    });
  };

  const handleChangeTransportOption = (option: TransportOption) => {
    if (!selectedTransportGroup) return;

    setSelectedOptionIdByRoute((prev) => ({
      ...prev,
      [getTransportRouteKey(selectedTransportGroup)]: option.id,
    }));
  };

  return (
    <div>
      <div className="flex items-end gap-3">
        <h2 className="font-ssurround text-lg text-text-heading">오늘의 일정</h2>
        <p className="font-paperlogy text-sm font-semibold text-sub-darkgray">{day.date}</p>
      </div>

      <ol className="mt-4">
        {plans.map((plan, index) => {
          const isPlanVerified = plan.isVerified || verifiedPlaceNames.has(plan.place);
          const nextPlan = plans[index + 1];
          const transportGroup = nextPlan
            ? findTransportGroupByPlaces(plan.place, nextPlan.place)
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
              key={`${plan.time}-${plan.place}`}
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
                    isPlanVerified
                      ? "size-4 shrink-0 rounded-full bg-main-blue"
                      : "size-4 shrink-0 rounded-full bg-sub-pink"
                  }
                />

                <div className="min-w-0 flex-1">
                  <p className="leading-4 text-md font-medium text-text-primary">{plan.place}</p>
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

              {isPlanVerified ? (
                <StatusBadge
                  status="completed"
                  className="shrink-0 px-2.5 py-1.5 text-sm mt-[7px]"
                />
              ) : (
                <button
                  type="button"
                  className="shrink-0 mt-[7px]"
                  onClick={() => openVerifyModal(plan.place)}
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
      <ArrivalVerifyModal
        isOpen={selectedVerifyPlaceName !== null}
        placeName={selectedVerifyPlaceName ?? ""}
        onClose={closeVerifyModal}
        onVerify={handleVerifyPlace}
        onLater={closeVerifyModal}
      />
    </div>
  );
}
