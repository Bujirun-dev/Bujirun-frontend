"use client";

import Image from "next/image";
import characterImg from "@/assets/character/map.png";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.svg?url";
import { Modal, TimePicker } from "@/components";
import { openKakaoMapRoute } from "./TransportSelectSheet";
import { ArrivalVerifyModal } from "./ArrivalVerifyModal";
import { AiOptimizeModal } from "./AiOptimizeModal";
import { AiOptimizeLoadingModal } from "./AiOptimizeLoadingModal";
import { TransportDetailModal } from "@/features/home/components/TransportDetailModal";
import type { TransportGroup, TransportOption } from "@/features/home/types/transport";
import type { RouteOption } from "./TransportSelectSheet";
import type { BaseStop } from "../utils/scheduleUtils";
import { buildTransportOptions } from "../utils/scheduleUtils";

export type ModalType =
  | "optimize"
  | "optimizing"
  | "delete"
  | "time"
  | "transport"
  | "verify"
  | "peerUpdate";

interface ItineraryModalsProps {
  modal: ModalType | null;
  activeStop: BaseStop | undefined;
  itineraryId: string;
  logId?: string;
  timeValue: { hour: number; minute: number };
  selectedRouteOptionId: string;
  peerUpdateMessage?: string;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmTime: () => void;
  onConfirmTransport: (option: RouteOption) => void;
  onConfirmVerify: () => void;
  onVerifyContinue?: () => void;
  onTimeChange: (value: { hour: number; minute: number }) => void;
  onOptimizeStart: () => void;
  isOptimizeDone?: boolean;
}

export function ItineraryModals({
  modal,
  activeStop,
  itineraryId,
  logId,
  timeValue,
  selectedRouteOptionId,
  peerUpdateMessage,
  onClose,
  onConfirmDelete,
  onConfirmTime,
  onConfirmTransport,
  onConfirmVerify,
  onVerifyContinue,
  onTimeChange,
  onOptimizeStart,
  isOptimizeDone,
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
        isDone={isOptimizeDone}
      />

      {/* 다른 참여자가 여행 로그를 불러와 일정이 통째로 바뀌었을 때 알려주는 안내 팝업 —
          짧게 보여주고 자동으로 닫힌다(호출부의 타이머가 onClose를 부름). */}
      <Modal
        isOpen={modal === "peerUpdate"}
        onClose={onClose}
        icon={
          <Image
            src={magicWandIcon}
            alt=""
            width={22}
            height={22}
            className="icon-coral"
            aria-hidden
          />
        }
        iconClassName="bg-sub-coral/10"
        title="일정이 업데이트됐어요"
        description={peerUpdateMessage}
        hideActions
        hideCloseButton
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

      {activeStop?.spotId && logId && (
        <ArrivalVerifyModal
          isOpen={modal === "verify"}
          spotId={activeStop.spotId}
          itineraryId={itineraryId}
          logId={logId}
          itemId={activeStop.id}
          placeName={activeStop.placeName}
          characterImageUrl={characterImg.src}
          onClose={onClose}
          onVerify={onConfirmVerify}
          onLater={onVerifyContinue ?? onClose}
        />
      )}
    </>
  );
}
