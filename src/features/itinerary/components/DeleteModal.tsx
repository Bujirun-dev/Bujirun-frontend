import { Modal } from "@/components";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, onClose, placeName, onConfirm }: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="🗑"
      title="일정 삭제"
      description={`'${placeName}'을(를)\n일정에서 삭제하시겠어요?`}
      confirmText="삭제하기"
      cancelText="취소"
      onConfirm={onConfirm}
      confirmVariant="danger"
    >
      <span className="font-paperlogy text-[12px] text-sub-gray text-center">
        * 삭제한 일정은 복구할 수 없어요.
      </span>
    </Modal>
  );
}
