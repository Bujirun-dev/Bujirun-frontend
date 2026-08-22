import Image from "next/image";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.svg?url";
import { Modal } from "@/components";

interface AiOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accommodationName?: string;
}

export function AiOptimizeModal({
  isOpen,
  onClose,
  onConfirm,
  accommodationName,
}: AiOptimizeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <Image
          src={magicWandIcon}
          alt=""
          width={25}
          height={25}
          className="block icon-coral"
          aria-hidden
        />
      }
      title="AI 일정 최적화"
      description={
        accommodationName
          ? "숙소를 기준으로\n관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."
          : "관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."
      }
      confirmText="최적화 시작"
      cancelText="취소"
      confirmVariant="primary"
      onConfirm={onConfirm}
      onCancel={onClose}
    >
      <div className="flex flex-col items-center w-full">
        {accommodationName && (
          <>
            <p className="text-md font-semibold text-sub-darkgray leading-none">
              🏨 {accommodationName}
            </p>
            <div className="my-2 h-px w-full bg-sub-lightgray/50" />
          </>
        )}
        <div className="flex flex-col items-start gap-0.5">
          <p className="text-sm font-medium text-sub-darkgray leading-none">✨ 이동 동선 최적화</p>
          <p className="text-sm font-medium text-sub-darkgray leading-none">⏰ 이동 시간 단축</p>
          <p className="text-sm font-medium text-sub-darkgray leading-none">🚌 교통비 절약</p>
        </div>
      </div>
    </Modal>
  );
}
