"use client";

import characterImg from "@/assets/character/map.png";
import { Modal, TimePicker } from "@/components";
import { TransportSelectSheet } from "./TransportSelectSheet";
import { ArrivalVerifyModal } from "./ArrivalVerifyModal";
import { AiOptimizeModal } from "./AiOptimizeModal";
import { AiOptimizeLoadingModal } from "./AiOptimizeLoadingModal";
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
        title="일정 삭제"
        description={`해당 관광지를 일정에서\n삭제하시겠어요?`}
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="warning"
        onConfirm={onConfirmDelete}
        onCancel={onClose}
      />

      <TimePicker
        isOpen={modal === "time"}
        hour={timeValue.hour}
        minute={timeValue.minute}
        onChange={(h, m) => onTimeChange({ hour: h, minute: m })}
        onConfirm={onConfirmTime}
        onClose={onClose}
      />

      <TransportSelectSheet
        isOpen={modal === "transport"}
        onClose={onClose}
        from={activeStop?.transport?.from ?? "출발 장소"}
        to={activeStop?.transport?.to ?? "도착 장소"}
        selectedOptionId={selectedRouteOptionId}
        options={buildTransportOptions(activeStop)}
        onSelect={onConfirmTransport}
      />

      <ArrivalVerifyModal
        isOpen={modal === "verify"}
        onClose={onClose}
        placeName={activeStop?.placeName ?? ""}
        characterImageUrl={characterImg.src}
        onVerify={onConfirmVerify}
        onLater={onClose}
      />
    </>
  );
}
