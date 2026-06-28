import Image from "next/image";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import { Toast } from "@/components";

interface TripDeleteToastProps {
  isVisible: boolean;
  onHide: () => void;
}

export function TripDeleteToast({ isVisible, onHide }: TripDeleteToastProps) {
  return (
    <Toast
      isVisible={isVisible}
      onHide={onHide}
      message="여행이 삭제되었어요."
      icon={
        <Image
          src={removeIcon}
          alt=""
          width={12}
          height={12}
          className="brightness-0 invert"
          aria-hidden
        />
      }
    />
  );
}
