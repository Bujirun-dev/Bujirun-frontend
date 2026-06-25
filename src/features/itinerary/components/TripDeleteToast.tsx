import Image from "next/image";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";
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
      icon={<Image src={removeWhiteIcon} alt="삭제" width={12} height={12} />}
    />
  );
}
