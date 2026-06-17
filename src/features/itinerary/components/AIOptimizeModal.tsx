import { Modal } from "@/components";

interface AIOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AIOptimizeModal({ isOpen, onClose, onConfirm }: AIOptimizeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="✨"
      title="AI 일정 최적화"
      description={"관광지의 위치와 이동 경로를 분석해\n더 효율적인 여행 코스를 추천해드릴게요."}
      confirmText="최적화 시작"
      cancelText="취소"
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2 font-paperlogy text-[13px] text-text-primary">
        <span>✨ 이동 동선 최적화</span>
        <span>⏰ 이동 시간 단축</span>
        <span>🚌 교통비 절약</span>
      </div>
    </Modal>
  );
}
