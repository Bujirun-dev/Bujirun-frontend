"use client";

import Image from "next/image";
import characterImg from "@/assets/character/map.png";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
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
        onContinue={onVerifyContinue}
        onLater={onClose}
      />
    </>
  );
}
