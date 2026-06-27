import MagicWandIcon from "@/assets/icons/itinerary/magic-wand.svg";
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
      icon={<MagicWandIcon width={25} height={25} className="block icon-coral" aria-hidden />}
      iconClassName="bg-sub-coral/10"
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
          <p className="text-sm font-medium text-sub-darkgray leading-none">✨ 이동 동선 최적화</p>
          <p className="text-sm font-medium text-sub-darkgray leading-none">⏰ 이동 시간 단축</p>
          <p className="text-sm font-medium text-sub-darkgray leading-none">🚌 교통비 절약</p>
        </div>
      </div>
    </Modal>
  );
}
