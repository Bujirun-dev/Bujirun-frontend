"use client";

import Image from "next/image";
import characterImg from "@/assets/character/map.png";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import { Modal, TimePicker } from "@/components";
import { openKakaoMapRoute } from "./TransportSelectSheet";
// import { ArrivalVerifyModal } from "./ArrivalVerifyModal";
import { AiOptimizeModal } from "./AiOptimizeModal";
import { AiOptimizeLoadingModal } from "./AiOptimizeLoadingModal";
import { TransportDetailModal } from "@/features/home/components/TransportDetailModal";
import type { TransportGroup, TransportOption } from "@/features/home/types/transport";
import type { RouteOption } from "./TransportSelectSheet";
import type { BaseStop } from "../utils/scheduleUtils";
import { buildTransportOptions } from "../utils/scheduleUtils";

export type ModalType = "optimize" | "optimizing" | "delete" | "time" | "transport" | "verify";

interface ItineraryModalsProps {
  modal: ModalType | null;
  activeStop: BaseStop | undefined;
  timeValue: { hour: number; minute: number };
  selectedRouteOptionId: string;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmTime: () => void;
  onConfirmTransport: (option: RouteOption) => void;
  onConfirmVerify: () => void;
  onVerifyContinue?: () => void;
  onTimeChange: (value: { hour: number; minute: number }) => void;
  onOptimizeStart: () => void;
}

export function ItineraryModals({
  modal,
  activeStop,
  timeValue,
  selectedRouteOptionId,
  onClose,
  onConfirmDelete,
  onConfirmTime,
  onConfirmTransport,
  onConfirmVerify,
  onVerifyContinue,
  onTimeChange,
  onOptimizeStart,
}: ItineraryModalsProps) {
  return (
    <>
      <AiOptimizeModal
        isOpen={modal === "optimize"}
        onClose={onClose}
        onConfirm={onOptimizeStart}
      />

      <AiOptimizeLoadingModal
        isOpen={modal === "optimizing"}
        onClose={onClose}
        onComplete={onClose}
      />

      <Modal
        isOpen={modal === "delete"}
        onClose={onClose}
        icon={
          <Image
            src={removeIcon}
            alt=""
            width={25}
            height={25}
            className="icon-coral"
            aria-hidden
          />
        }
        iconClassName="size-[48px] bg-system-navbg"
        title="일정 삭제"
        description={`'${activeStop?.placeName ?? "관광지"}'을(를)\n일정에서 삭제하시겠어요?`}
        childrenVariant="card"
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="warning"
        onConfirm={onConfirmDelete}
        onCancel={onClose}
      >
        <p className="text-center font-medium text-sub-darkgray">
          * 삭제한 일정은 복구할 수 없어요.
        </p>
      </Modal>

      <TimePicker
        isOpen={modal === "time"}
        hour={timeValue.hour}
        minute={timeValue.minute}
        onChange={(h, m) => onTimeChange({ hour: h, minute: m })}
        onConfirm={onConfirmTime}
        onClose={onClose}
      />

      {(() => {
        const routeOptions = buildTransportOptions(activeStop);
        const transportGroup: TransportGroup = {
          fromPlace: activeStop?.transport?.from ?? "출발 장소",
          toPlace: activeStop?.transport?.to ?? "도착 장소",
          selectedOptionId: selectedRouteOptionId,
          options: routeOptions.map((option) => ({
            id: option.id,
            durationText: `${option.durationMin}분`,
            costText: `${(option.cost ?? 0).toLocaleString()}원`,
            isRecommended: option.isRecommended,
            steps: option.legs.map((leg) => ({
              type: leg.type,
              routeName: leg.routeName,
              from: leg.from,
              to: leg.to,
            })),
          })),
        };

        const handleChange = (option: TransportOption) => {
          const original = routeOptions.find((routeOption) => routeOption.id === option.id);
          if (original) onConfirmTransport(original);
        };

        return (
          <TransportDetailModal
            isOpen={modal === "transport"}
            transportGroup={transportGroup}
            selectedOptionId={selectedRouteOptionId}
            onClose={onClose}
            onChange={handleChange}
            onKakaoMapClick={() =>
              openKakaoMapRoute(transportGroup.fromPlace, transportGroup.toPlace)
            }
          />
        );
      })()}

      {/*
  TODO: 일정 조회 API 연동 후 ArrivalVerifyModal 다시 연결
  필요한 실제 데이터:
  - spotId: activeStop의 관광지 ID
  - itineraryId: 일정 상세 API의 일정 ID
  - logId: 현재 일정에 연결된 로그 ID
  - itemId: activeStop의 일정 아이템 ID

  현재 일정 화면은 실제 ID를 제공하지 않아 임시로 렌더링을 보류합니다.
  일정 조회 연동 후 위 값을 ItineraryModals props로 전달해 인증 모달을 연결해야 합니다.
*/}

      {/* <ArrivalVerifyModal
        isOpen={modal === "verify"}
        spotId={activeStop?.spotId ?? ""}
        itineraryId={activeStop?.itineraryId ?? ""}
        logId={activeStop?.logId ?? ""}
        itemId={activeStop?.itemId ?? ""}
        placeName={activeStop?.placeName ?? "관광지"}
        characterImageUrl={characterImg.src}
        onClose={onClose}
        onVerify={onConfirmVerify}
        onLater={onVerifyContinue}
      /> */}
    </>
  );
}
