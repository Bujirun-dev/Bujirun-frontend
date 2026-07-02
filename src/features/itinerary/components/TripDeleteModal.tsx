import Image from "next/image";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import { Modal } from "@/components";

interface TripDeleteModalProps {
  isOpen: boolean;
  tripName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function TripDeleteModal({ isOpen, tripName, onClose, onConfirm }: TripDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <Image src={removeIcon} alt="" width={25} height={25} className="icon-coral" aria-hidden />
      }
      iconClassName="size-[48px] bg-system-navbg"
      title="여행 삭제"
      description={`'${tripName}' 여행을\n삭제하시겠어요?`}
      childrenVariant="card"
      cancelText="취소"
      confirmText="삭제하기"
      confirmVariant="warning"
      onConfirm={onConfirm}
    >
      <p className="text-center font-medium text-sub-darkgray">
        * 삭제한 여행은 복구할 수 없어요.
      </p>
    </Modal>
  );
}
