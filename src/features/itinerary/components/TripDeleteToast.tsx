"use client";

import { useEffect } from "react";
import Image from "next/image";
import removeWhiteIcon from "@/assets/icons/itinerary/remove-white.png";

interface TripDeleteToastProps {
  isVisible: boolean;
  onHide: () => void;
}

export function TripDeleteToast({ isVisible, onHide }: TripDeleteToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onHide, 2500);
    return () => clearTimeout(timer);
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-sub-gray/90">
        <Image src={removeWhiteIcon} alt="삭제" width={14} height={14} />
        <span className="font-paperlogy text-[13px] text-white whitespace-nowrap">여행이 삭제되었어요.</span>
      </div>
    </div>
  );
}
