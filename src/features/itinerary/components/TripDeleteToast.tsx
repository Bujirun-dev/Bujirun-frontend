import RemoveIcon from "@/assets/icons/itinerary/remove.svg";
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
      icon={<RemoveIcon width={12} height={12} className="fill-white" aria-hidden />}
    />
  );
}
