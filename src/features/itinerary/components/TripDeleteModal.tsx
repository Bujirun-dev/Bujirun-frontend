import Image from "next/image";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import { Card, Modal } from "@/components";

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
      titleClassName="font-bold text-xl text-text-heading"
      childrenVariant="plain"
      cancelText="취소"
      confirmText="삭제하기"
      confirmVariant="warning"
      onConfirm={onConfirm}
    >
      <div className="flex w-full flex-col items-center gap-4">
        <p className="text-center text-lg font-semibold leading-relaxed text-text-primary">
          {`'${tripName}' 여행을`}
          <br />
          삭제하시겠어요?
        </p>
        <Card variant="glass-sm" className="w-full rounded-lg px-3 py-2">
          <p className="text-center text-sm font-medium text-sub-darkgray">
            * 삭제한 여행은 복구할 수 없어요.
          </p>
        </Card>
      </div>
    </Modal>
  );
}
