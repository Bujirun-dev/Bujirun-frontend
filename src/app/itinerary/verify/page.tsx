"use client";

import { useRouter } from "next/navigation";
import { ArrivalVerifyModal } from "@/features/itinerary";
import { PageCard } from "@/components";
import characterImg from "@/assets/character/face.png";

export default function VerifyPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col relative">
      <PageCard />
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
