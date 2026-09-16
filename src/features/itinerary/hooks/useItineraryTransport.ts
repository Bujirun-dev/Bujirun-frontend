"use client";
import { useQuery } from "@tanstack/react-query";
import { itineraryApi } from "@/shared/api/domains";
import type { RouteOption, ModalType } from "@/features/itinerary";
import type { TripTimeBounds } from "@/shared/utils/tripTimeBounds";
import {
  type BaseStop,
  buildTransportFromItem,
  toBackendTravelMode,
  timeToMinutes,
  roundToNearest10,
} from "../utils/scheduleUtils";
import type { useCollaborativeItinerary } from "@/features/itinerary/collab/useCollaborativeItinerary";
type Collaboration = ReturnType<typeof useCollaborativeItinerary>;
type ShowToast = (message: string, variant?: "itinerary" | "error") => void;

interface TransportParams {
  itineraryId: string;
  dayIdsSliced: string[];
  activeDayIdx: number;
  activeStopId: string | null;
  activeStop: BaseStop | undefined;
  stopsPerDay: BaseStop[][];
  tripTimeBounds: TripTimeBounds | null;
  modal: ModalType | null;
  updateYjsStopTransport: Collaboration["updateStopTransport"];
  shiftYjsFollowingStopTimes: Collaboration["shiftFollowingStopTimes"];
  showToast: ShowToast;
}
export function useItineraryTransport({
  itineraryId,
  dayIdsSliced,
  activeDayIdx,
  activeStopId,
  activeStop,
  stopsPerDay,
  tripTimeBounds,
  modal,
  updateYjsStopTransport,
  shiftYjsFollowingStopTimes,
  showToast,
}: TransportParams) {
  // 이동수단 변경 모달을 열 때만 후보(지하철 전용/버스 전용/버스+지하철 조합/도보/택시)와
  // 각각의 실제 요금·소요시간을 조회한다 — 확정 전 미리보기라 매번 새로 계산된 값이 필요하다.
  //
  // ItineraryItem은 "직전 항목 → 이 항목" 도착 구간 정보를 자기 자신에 저장하는 컨벤션이라
  // (addItem/optimize/saveConfirmedItinerary 전부 동일), travel-mode 조회/변경 API는 activeStop
  // 자신의 id가 아니라 "다음 항목"의 id를 받아야 한다. activeStopId를 그대로 넘기면 백엔드가
  // "이 항목의 이전 항목"을 찾아 엉뚱한 구간을 계산하고, activeStop이 그 day의 첫 항목이면
  // "첫 번째 방문 항목은 이동수단 옵션이 없습니다"를 잘못 던진다(2026-08-19 버그 리포트).
  const travelModeOptionsDayId = dayIdsSliced[activeDayIdx];
  const travelModeTargetItemId = activeStop?.transport?.toStopId;
  const { data: travelModeOptions } = useQuery({
    queryKey: itineraryApi.keys.travelModeOptions(
      itineraryId ?? "",
      travelModeOptionsDayId ?? "",
      travelModeTargetItemId ?? "",
    ),
    queryFn: () =>
      itineraryApi.getTravelModeOptions(
        itineraryId as string,
        travelModeOptionsDayId as string,
        travelModeTargetItemId as string,
      ),
    enabled:
      modal === "transport" &&
      !!itineraryId &&
      !!travelModeOptionsDayId &&
      !!travelModeTargetItemId,
  });
  // 이동수단 변경은 프론트에서 소요시간/역명을 추정하지 않고, 백엔드가 ODsay로 실제
  // 재계산한 경로(진짜 역명·노선번호)를 받아와 반영한다 — 예전엔 로컬에서 "장소명역" 같은
  // 이름을 지어내서 실제로 존재하지 않는 역이 표시되는 문제가 있었다.
  // 모달을 언제 닫을지는 TransportDetailModal이 "확인" 처리 결과(반환값)를 보고 스스로
  // 결정한다 — 여기서 closeModal()을 직접 부르면, 사용자가 확인을 누르기도 전에
  // (목록에서 옵션만 골랐을 뿐인데) 비동기 응답이 오는 시점에 모달이 제멋대로 닫혀버린다.
  // 성공 시 true, 실패/스킵 시 false를 반환해서 모달이 닫힐지 말지 결정하게 한다.
  const confirmTransport = async (option: RouteOption): Promise<boolean> => {
    const dayId = dayIdsSliced[activeDayIdx];
    const dayStops = stopsPerDay[activeDayIdx] ?? [];
    const activeIdx = dayStops.findIndex((s) => s.id === activeStopId);
    const nextStop = dayStops[activeIdx + 1];

    // transport는 항상 "다음 스팟까지의 구간" 정보라 nextStop 없이 존재할 수 없다.
    if (!activeStopId || !activeStop?.transport || !dayId || !nextStop) {
      showToast("교통수단을 변경할 수 없어요.", "error");
      return false;
    }

    let updatedItem;
    try {
      // option.id는 화면 구분용 값(walk/taxi/bus/subway/combo)이라 백엔드 travelMode
      // (walk/transit/taxi)와 다르다 — toBackendTravelMode()로 변환 후 전송한다.
      // itemId는 activeStopId(출발 항목)가 아니라 nextStop.id(도착 항목) — ItineraryItem은
      // "직전 항목 → 이 항목" 구간 정보를 도착 항목 자신에 저장하는 컨벤션이라, 백엔드가
      // 재계산할 대상은 항상 도착 항목이다.
      updatedItem = await itineraryApi.updateTravelMode(itineraryId, dayId, nextStop.id, {
        travelMode: toBackendTravelMode(option.id),
      });
    } catch {
      showToast("교통수단 변경에 실패했어요.", "error");
      return false;
    }

    const transport = buildTransportFromItem(
      updatedItem,
      activeStop.placeName,
      nextStop.placeName,
      nextStop.id,
      option.durationMin,
      option.cost,
    );
    if (!transport) {
      showToast("교통수단 변경에 실패했어요.", "error");
      return false;
    }
    updateYjsStopTransport(activeDayIdx, activeStopId, transport);

    // 소요시간이 바뀐 만큼 다음 스팟부터 그날 남은 일정 시간을 밀어준다 —
    // 사용자가 직접 시간을 정해둔 스팟을 만나거나 여행 종료 시간을 넘기면 거기서 멈춘다.
    const newNextMinutes = roundToNearest10(timeToMinutes(activeStop.time) + transport.durationMin);
    const delta = newNextMinutes - timeToMinutes(nextStop.time);
    const isLastDay = activeDayIdx === dayIdsSliced.length - 1;
    const boundaryMinutes =
      isLastDay && tripTimeBounds?.endTime ? timeToMinutes(tripTimeBounds.endTime) : undefined;

    const result = shiftYjsFollowingStopTimes(activeDayIdx, activeStopId, delta, boundaryMinutes);

    if (result.cappedAtBoundary) {
      showToast(
        "교통수단은 바뀌었지만, 여행 종료 시간을 넘어서 일부 일정은 자동으로 조정하지 못했어요.",
        "error",
      );
      return true;
    }
    if (result.shiftedCount > 0) {
      showToast("교통수단이 변경돼서 이후 일정 시간도 조정됐어요.");
      return true;
    }

    showToast("교통수단이 변경되었어요.");
    return true;
  };
  return { travelModeOptions, confirmTransport };
}
