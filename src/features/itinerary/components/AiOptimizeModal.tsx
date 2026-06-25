import Image from "next/image";
import magicWandIcon from "@/assets/icons/itinerary/magic-wand.png";
import freepassBlueIcon from "@/assets/icons/itinerary/freepass-blue.png";
import { Modal } from "@/components";

interface AiOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AiOptimizeModal({ isOpen, onClose, onConfirm }: AiOptimizeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Image src={magicWandIcon} alt="AI 최적화" width={28} height={28} />}
      title="AI 일정 최적화"
      description={"관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."}
      confirmText="최적화 시작"
      cancelText="취소"
      confirmVariant="primary"
      onConfirm={onConfirm}
      onCancel={onClose}
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-start gap-0.5">
          <p className="flex items-center gap-1.5 font-paperlogy text-sm font-medium text-sub-darkgray leading-none">
            <Image src={freepassBlueIcon} alt="" width={12} height={12} />
            이동 동선 최적화
          </p>
          <p className="font-paperlogy text-sm font-medium text-sub-darkgray leading-none">
            ⏰ 이동 시간 단축
          </p>
          <p className="font-paperlogy text-sm font-medium text-sub-darkgray leading-none">
            🚌 교통비 절약
          </p>
        </div>
      </div>
    </Modal>
  );
}
