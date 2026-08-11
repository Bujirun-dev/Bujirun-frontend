import Image from "next/image";
import removeIcon from "@/assets/icons/itinerary/remove.svg?url";
import { Toast } from "@/components";

interface TripDeleteToastProps {
  action: "delete" | "leave" | null;
  onHide: () => void;
}

export function TripDeleteToast({ action, onHide }: TripDeleteToastProps) {
  return (
    <Toast
      isVisible={action !== null}
      onHide={onHide}
      message={action === "leave" ? "여행 일정에서 나왔어요." : "여행이 삭제되었어요."}
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
