"use client";

import { useRouter } from "next/navigation";
import { ArrivalVerifyModal } from "@/features/itinerary";
import characterImg from "@/assets/character/face.png";

export default function VerifyPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col relative">
      <div className="flex flex-1 flex-col rounded-tl-[40px] rounded-tr-[40px] bg-white" />
      <ArrivalVerifyModal
        isOpen
        onClose={() => router.back()}
        placeName="해운대 해수욕장"
        characterImageUrl={characterImg.src}
        onVerify={() => router.back()}
        onLater={() => router.back()}
      />
    </div>
  );
}
